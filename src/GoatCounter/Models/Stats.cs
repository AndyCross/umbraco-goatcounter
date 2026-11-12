namespace GoatCounter.Models;

/// <summary>Views of one path over a period, with the count for each day.</summary>
public record PathHits(long PathId, string Path, string Title, bool IsEvent, int Count, IReadOnlyList<DayCount> Days);

public record DayCount(string Day, int Count);

/// <summary>One row of a breakdown: a referrer, browser, country and so on.</summary>
public record NamedCount(string Name, int Count);

public record PageCount(string Path, string Title, int Count);

/// <summary>What the dashboard shows for a period.</summary>
public class SummaryModel
{
    public bool Configured { get; set; }
    public string? Message { get; set; }
    public string? SiteUrl { get; set; }
    public bool CountingPageViews { get; set; }
    public string Start { get; set; } = "";
    public string End { get; set; } = "";
    public int Total { get; set; }
    public IReadOnlyList<DayCount> Days { get; set; } = [];
    public IReadOnlyList<PageCount> Pages { get; set; } = [];
    public IReadOnlyList<NamedCount> Referrers { get; set; } = [];
    public IReadOnlyList<NamedCount> Browsers { get; set; } = [];
    public IReadOnlyList<NamedCount> Systems { get; set; } = [];
    public IReadOnlyList<NamedCount> Locations { get; set; } = [];
    public IReadOnlyList<NamedCount> Sizes { get; set; } = [];
}

/// <summary>Views of one document over a period.</summary>
public class DocumentStatsModel
{
    public bool Configured { get; set; }
    public string? Message { get; set; }
    public string Start { get; set; } = "";
    public string End { get; set; } = "";
    public IReadOnlyList<string> Paths { get; set; } = [];
    public int Total { get; set; }
    public IReadOnlyList<DayCount> Days { get; set; } = [];
}

/// <summary>A page view to record.</summary>
public record PageView(string Path, string? Title, string? Referrer, string? Query, string? Size, string? Ip, string? UserAgent, DateTime At);
