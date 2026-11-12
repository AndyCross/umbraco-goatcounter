using System.Text.Json;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace GoatCounter;

public static class GoatCounterHtmlExtensions
{
    /// <summary>
    /// The page-view beacon. Put <c>@Html.GoatCounterBeacon()</c> in your layout's head. It writes nothing unless
    /// counting is on and the request is for a host you count, so development and staging sites stay silent.
    /// </summary>
    public static IHtmlContent GoatCounterBeacon(this IHtmlHelper html)
    {
        var http = html.ViewContext.HttpContext;
        var o = http.RequestServices.GetRequiredService<IOptionsMonitor<GoatCounterOptions>>().CurrentValue;
        if (!o.CountPageViews || o.BaseUri is null || !o.CountsFor(http.Request.Host.Host)) return HtmlString.Empty;
        var route = JsonSerializer.Serialize(o.Route);
        return new HtmlString(
            "<script>(function(){if(navigator.webdriver)return;function s(){var q=new URLSearchParams({p:location.pathname,t:document.title," +
            "r:document.referrer,s:String(screen.width),q:location.search});new Image().src=" + route + "+'?'+q;}" +
            "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',s);else s();})();</script>");
    }
}
