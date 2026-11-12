namespace GoatCounter;

/// <summary>Settings, from the <c>GoatCounter</c> section of configuration.</summary>
public class GoatCounterOptions
{
    public const string Section = "GoatCounter";

    /// <summary>Your GoatCounter site: the code (<c>mysite</c> for mysite.goatcounter.com) or the full URL of a self-hosted one.</summary>
    public string? Site { get; set; }

    /// <summary>An API key that can read statistics. Used by the dashboard.</summary>
    public string? Token { get; set; }

    /// <summary>An API key that can record page views. Used by the first-party counter. Falls back to <see cref="Token"/>.</summary>
    public string? CountToken { get; set; }

    /// <summary>Turns the first-party counter on. Off by default, so installing the package sends nothing.</summary>
    public bool CountPageViews { get; set; }

    /// <summary>The path the page-view beacon is sent to on your own site. Keep it short and dull:
    /// blockers match paths like /count and /collect as well as domains.</summary>
    public string Route { get; set; } = "/s";

    /// <summary>Host names page views are counted for, e.g. <c>example.com</c>. Empty means any host
    /// except localhost. A request for any other host is answered but not counted.</summary>
    public string[] Hostnames { get; set; } = [];

    /// <summary>How long statistics are kept before GoatCounter is asked again.</summary>
    public int CacheMinutes { get; set; } = 5;

    public Uri? BaseUri =>
        string.IsNullOrWhiteSpace(Site) ? null
        : Site.Contains("://") ? new Uri(Site.TrimEnd('/') + "/")
        : new Uri($"https://{Site.Trim()}.goatcounter.com/");

    public bool CountsFor(string host) =>
        Hostnames.Length > 0
            ? Hostnames.Contains(host, StringComparer.OrdinalIgnoreCase)
            : !(host.Equals("localhost", StringComparison.OrdinalIgnoreCase) || host.StartsWith("127.") || host == "[::1]" || host == "::1");
}
