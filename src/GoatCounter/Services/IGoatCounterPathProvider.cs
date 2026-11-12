using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Extensions;

namespace GoatCounter.Services;

/// <summary>
/// The paths a document's views are recorded under. The default is its URL. Register your own to add
/// others, such as the address a page had before a migration, so its history counts too.
/// </summary>
public interface IGoatCounterPathProvider
{
    IEnumerable<string> PathsFor(IPublishedContent content);
}

public class UrlPathProvider : IGoatCounterPathProvider
{
    public IEnumerable<string> PathsFor(IPublishedContent content)
    {
        var url = content.Url(mode: UrlMode.Relative);
        if (!string.IsNullOrEmpty(url) && url != "#") yield return url;
    }
}
