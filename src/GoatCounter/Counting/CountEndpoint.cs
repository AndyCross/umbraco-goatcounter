using GoatCounter.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace GoatCounter.Counting;

/// <summary>
/// The first-party counter. The page requests <c>{Route}?p=/path&amp;t=Title&amp;r=referrer&amp;s=1440&amp;q=?utm=...</c>
/// from your own site as an image; this answers with a 1x1 GIF and queues the view for GoatCounter with the
/// visitor's IP and User-Agent, which GoatCounter uses for sessions, location and bot detection.
/// Blockers that know gc.zgo.at and *.goatcounter.com never see a request to them.
/// </summary>
public static class CountEndpoint
{
    private static readonly byte[] Gif = Convert.FromBase64String("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");

    public static async Task Handle(HttpContext http, IOptionsMonitor<GoatCounterOptions> options, PageViewQueue queue)
    {
        var o = options.CurrentValue;
        var q = http.Request.Query;
        var path = Limit(q["p"], 2048);
        if (o.CountPageViews && o.CountsFor(http.Request.Host.Host) && path is not null && path.StartsWith('/'))
        {
            string? size = null;
            if (double.TryParse(q["s"], System.Globalization.CultureInfo.InvariantCulture, out var width) && width is > 0 and < 20000)
                size = width.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture);
            queue.Add(new PageView(path, Limit(q["t"], 512), Limit(q["r"], 2048), Limit(q["q"], 2048), size,
                http.Connection.RemoteIpAddress?.ToString(), Limit(http.Request.Headers.UserAgent, 512), DateTime.UtcNow));
        }
        http.Response.ContentType = "image/gif";
        http.Response.Headers.CacheControl = "no-store";
        await http.Response.Body.WriteAsync(Gif);
    }

    private static string? Limit(string? value, int max) =>
        string.IsNullOrEmpty(value) ? null : value.Length > max ? value[..max] : value;
}
