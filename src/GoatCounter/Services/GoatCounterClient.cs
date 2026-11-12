using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using GoatCounter.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GoatCounter.Services;

/// <summary>
/// Talks to GoatCounter's v0 API: reads statistics (cached for a few minutes) and records page views.
/// The API keys stay on the server; the browser never sees them or GoatCounter.
/// </summary>
public class GoatCounterClient(HttpClient http, IOptionsMonitor<GoatCounterOptions> options, IMemoryCache cache, ILogger<GoatCounterClient> logger)
{
    private const int MaxPaths = 2000;
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> Gates = new();

    private GoatCounterOptions Options => options.CurrentValue;

    public bool CanRead => Options.BaseUri is not null && !string.IsNullOrWhiteSpace(Options.Token);
    public bool CanCount => Options.BaseUri is not null && !string.IsNullOrWhiteSpace(Options.CountToken ?? Options.Token);

    /// <summary>Every path viewed between two days (inclusive), most viewed first.</summary>
    public Task<IReadOnlyList<PathHits>> HitsAsync(DateOnly start, DateOnly end, CancellationToken ct = default) =>
        Cached($"hits:{start}:{end}", async () =>
        {
            var all = new List<PathHits>();
            var seen = new List<long>();
            while (all.Count < MaxPaths)
            {
                var url = $"api/v0/stats/hits?{Range(start, end)}&daily=true&limit=100" + (seen.Count == 0 ? "" : "&exclude_paths=" + string.Join(",", seen));
                using var doc = await GetAsync(url, ct);
                var hits = doc.RootElement.TryGetProperty("hits", out var h) && h.ValueKind == JsonValueKind.Array ? h.EnumerateArray().ToList() : [];
                foreach (var hit in hits)
                {
                    var id = hit.GetProperty("path_id").GetInt64();
                    seen.Add(id);
                    var days = hit.TryGetProperty("stats", out var s) && s.ValueKind == JsonValueKind.Array
                        ? s.EnumerateArray().Select(d => new DayCount(d.GetProperty("day").GetString() ?? "", d.TryGetProperty("daily", out var n) ? n.GetInt32() : 0)).ToList()
                        : [];
                    all.Add(new PathHits(id, Text(hit, "path"), Text(hit, "title"),
                        hit.TryGetProperty("event", out var ev) && ev.ValueKind == JsonValueKind.True, hit.GetProperty("count").GetInt32(), days));
                }
                if (hits.Count == 0 || !doc.RootElement.TryGetProperty("more", out var more) || more.ValueKind != JsonValueKind.True) break;
            }
            return (IReadOnlyList<PathHits>)all.OrderByDescending(x => x.Count).ToList();
        }, ct);

    /// <summary>Total views for each day between two days (inclusive).</summary>
    public Task<(int Total, IReadOnlyList<DayCount> Days)> TotalAsync(DateOnly start, DateOnly end, CancellationToken ct = default) =>
        Cached($"total:{start}:{end}", async () =>
        {
            using var doc = await GetAsync($"api/v0/stats/total?{Range(start, end)}", ct);
            var days = doc.RootElement.TryGetProperty("stats", out var s) && s.ValueKind == JsonValueKind.Array
                ? s.EnumerateArray().Select(d => new DayCount(d.GetProperty("day").GetString() ?? "", d.TryGetProperty("daily", out var n) ? n.GetInt32() : 0)).ToList()
                : [];
            return (doc.RootElement.TryGetProperty("total", out var t) ? t.GetInt32() : 0, (IReadOnlyList<DayCount>)days);
        }, ct);

    /// <summary>A breakdown: <c>toprefs</c>, <c>browsers</c>, <c>systems</c>, <c>locations</c>, <c>sizes</c>, <c>languages</c> or <c>campaigns</c>.</summary>
    public Task<IReadOnlyList<NamedCount>> BreakdownAsync(string kind, DateOnly start, DateOnly end, int limit = 10, CancellationToken ct = default) =>
        Cached($"{kind}:{start}:{end}:{limit}", async () =>
        {
            using var doc = await GetAsync($"api/v0/stats/{kind}?{Range(start, end)}&limit={limit}", ct);
            var rows = doc.RootElement.TryGetProperty("stats", out var s) && s.ValueKind == JsonValueKind.Array ? s.EnumerateArray().ToList() : [];
            return (IReadOnlyList<NamedCount>)rows.Select(r =>
            {
                var name = Text(r, "name");
                if (name.Length == 0) name = Text(r, "id");
                return new NamedCount(name, r.GetProperty("count").GetInt32());
            }).ToList();
        }, ct);

    /// <summary>Records page views. GoatCounter takes up to 100 in one request.</summary>
    public async Task<bool> CountAsync(IReadOnlyList<PageView> views, CancellationToken ct = default)
    {
        if (!CanCount || views.Count == 0) return false;
        var body = new
        {
            no_sessions = false,
            hits = views.Select(v =>
            {
                var hit = new Dictionary<string, object?> { ["path"] = v.Path, ["created_at"] = v.At.ToString("yyyy-MM-ddTHH:mm:ssZ") };
                if (!string.IsNullOrEmpty(v.Title)) hit["title"] = v.Title;
                if (!string.IsNullOrEmpty(v.Referrer)) hit["ref"] = v.Referrer;
                if (!string.IsNullOrEmpty(v.Query)) hit["query"] = v.Query;
                if (!string.IsNullOrEmpty(v.Size)) hit["size"] = v.Size;
                if (!string.IsNullOrEmpty(v.Ip)) hit["ip"] = v.Ip;
                if (!string.IsNullOrEmpty(v.UserAgent)) hit["user_agent"] = v.UserAgent;
                return hit;
            }).ToList(),
        };
        using var request = new HttpRequestMessage(HttpMethod.Post, new Uri(Options.BaseUri!, "api/v0/count")) { Content = JsonContent.Create(body) };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", Options.CountToken ?? Options.Token);
        try
        {
            using var response = await http.SendAsync(request, ct);
            if (response.IsSuccessStatusCode) return true;
            logger.LogWarning("GoatCounter answered {Status} to {Count} page views: {Body}", (int)response.StatusCode, views.Count,
                (await response.Content.ReadAsStringAsync(ct)) is { Length: > 300 } b ? b[..300] : await response.Content.ReadAsStringAsync(ct));
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException)
        {
            logger.LogWarning("GoatCounter could not be reached to record {Count} page views: {Message}", views.Count, e.Message);
        }
        return false;
    }

    private static string Range(DateOnly start, DateOnly end) => $"start={start:yyyy-MM-dd}T00:00:00Z&end={end:yyyy-MM-dd}T23:59:59Z";

    private static string Text(JsonElement e, string name) => e.TryGetProperty(name, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() ?? "" : "";

    private async Task<JsonDocument> GetAsync(string relative, CancellationToken ct)
    {
        if (!CanRead) throw new InvalidOperationException("GoatCounter is not configured: set GoatCounter:Site and GoatCounter:Token.");
        for (var attempt = 0; ; attempt++)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, new Uri(Options.BaseUri!, relative));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", Options.Token);
            using var response = await http.SendAsync(request, ct);
            // GoatCounter allows a few requests a second; wait and try again when it says so.
            if (response.StatusCode == HttpStatusCode.TooManyRequests && attempt < 4)
            {
                await Task.Delay(TimeSpan.FromSeconds(1 + attempt), ct);
                continue;
            }
            response.EnsureSuccessStatusCode();
            return JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
        }
    }

    private async Task<T> Cached<T>(string key, Func<Task<T>> load, CancellationToken ct)
    {
        key = $"GoatCounter:{Options.Site}:{key}";
        if (cache.TryGetValue(key, out T? hit) && hit is not null) return hit;
        var gate = Gates.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(ct);
        try
        {
            if (cache.TryGetValue(key, out hit) && hit is not null) return hit;
            var value = await load();
            cache.Set(key, value, TimeSpan.FromMinutes(Math.Max(1, Options.CacheMinutes)));
            return value;
        }
        finally { gate.Release(); }
    }
}
