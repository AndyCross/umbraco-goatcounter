using GoatCounter.Models;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace GoatCounter.Services;

/// <summary>Statistics shaped for the backoffice and for site code: a summary of a period, and views per document.</summary>
public class GoatCounterStats(GoatCounterClient client, IEnumerable<IGoatCounterPathProvider> pathProviders, IOptionsMonitor<GoatCounterOptions> options)
{
    public static (DateOnly Start, DateOnly End) Period(int days)
    {
        var end = DateOnly.FromDateTime(DateTime.UtcNow);
        return (end.AddDays(-(Math.Clamp(days, 1, 366) - 1)), end);
    }

    /// <summary>A path as GoatCounter may have stored it: with or without the trailing slash, lower case.</summary>
    public static string Normalise(string path) => path.Length > 1 ? path.TrimEnd('/').ToLowerInvariant() : path;

    public IReadOnlyList<string> PathsFor(IPublishedContent content) =>
        pathProviders.SelectMany(p => p.PathsFor(content)).Select(Normalise).Distinct().ToList();

    public async Task<SummaryModel> SummaryAsync(int days, CancellationToken ct = default)
    {
        var (start, end) = Period(days);
        var model = new SummaryModel
        {
            Configured = client.CanRead, Start = start.ToString("yyyy-MM-dd"), End = end.ToString("yyyy-MM-dd"),
            SiteUrl = options.CurrentValue.BaseUri?.ToString(), CountingPageViews = options.CurrentValue.CountPageViews && client.CanCount,
        };
        if (!client.CanRead)
        {
            model.Message = "Set GoatCounter:Site and GoatCounter:Token in configuration to see statistics.";
            return model;
        }
        try
        {
            var total = await client.TotalAsync(start, end, ct);
            model.Total = total.Total;
            model.Days = total.Days;
            model.Pages = (await client.HitsAsync(start, end, ct)).Where(h => !h.IsEvent).Take(15).Select(h => new PageCount(h.Path, h.Title, h.Count)).ToList();
            model.Referrers = await client.BreakdownAsync("toprefs", start, end, 10, ct);
            model.Browsers = await client.BreakdownAsync("browsers", start, end, 6, ct);
            model.Systems = await client.BreakdownAsync("systems", start, end, 6, ct);
            model.Locations = await client.BreakdownAsync("locations", start, end, 8, ct);
            model.Sizes = await client.BreakdownAsync("sizes", start, end, 6, ct);
        }
        catch (HttpRequestException e)
        {
            model.Message = $"GoatCounter could not be read: {e.Message}";
        }
        return model;
    }

    /// <summary>Views recorded under any of the given paths, with the count for each day.</summary>
    public async Task<(int Total, IReadOnlyList<DayCount> Days)> ViewsAsync(IEnumerable<string> paths, int days, CancellationToken ct = default)
    {
        var (start, end) = Period(days);
        var wanted = paths.Select(Normalise).ToHashSet();
        var hits = (await client.HitsAsync(start, end, ct)).Where(h => !h.IsEvent && wanted.Contains(Normalise(h.Path))).ToList();
        var byDay = hits.SelectMany(h => h.Days).GroupBy(d => d.Day).ToDictionary(g => g.Key, g => g.Sum(d => d.Count));
        var series = Enumerable.Range(0, end.DayNumber - start.DayNumber + 1).Select(i => start.AddDays(i).ToString("yyyy-MM-dd"))
            .Select(day => new DayCount(day, byDay.GetValueOrDefault(day))).ToList();
        return (hits.Sum(h => h.Count), series);
    }

    /// <summary>Views of every path in a period, keyed by normalised path. For rankings such as "most read".</summary>
    public async Task<IReadOnlyDictionary<string, int>> ViewsByPathAsync(int days, CancellationToken ct = default)
    {
        var (start, end) = Period(days);
        return (await client.HitsAsync(start, end, ct)).Where(h => !h.IsEvent)
            .GroupBy(h => Normalise(h.Path)).ToDictionary(g => g.Key, g => g.Sum(h => h.Count));
    }
}
