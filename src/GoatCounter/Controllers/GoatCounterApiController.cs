using Asp.Versioning;
using GoatCounter.Models;
using GoatCounter.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Web;

namespace GoatCounter.Controllers
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "GoatCounter")]
    public class GoatCounterApiController(GoatCounterStats stats, GoatCounterClient client, IUmbracoContextFactory contexts, IPublishedContentQuery query)
        : GoatCounterApiControllerBase
    {
        /// <summary>Totals, pages, referrers and visitors for the last <paramref name="days"/> days.</summary>
        [HttpGet("summary")]
        [ProducesResponseType<SummaryModel>(StatusCodes.Status200OK)]
        public async Task<SummaryModel> Summary(int days = 30, CancellationToken ct = default) => await stats.SummaryAsync(days, ct);

        /// <summary>Views of one document for the last <paramref name="days"/> days.</summary>
        [HttpGet("document/{id:guid}")]
        [ProducesResponseType<DocumentStatsModel>(StatusCodes.Status200OK)]
        public async Task<DocumentStatsModel> Document(Guid id, int days = 30, CancellationToken ct = default)
        {
            var (start, end) = GoatCounterStats.Period(days);
            var model = new DocumentStatsModel { Configured = client.CanRead, Start = start.ToString("yyyy-MM-dd"), End = end.ToString("yyyy-MM-dd") };
            if (!client.CanRead)
            {
                model.Message = "Set GoatCounter:Site and GoatCounter:Token in configuration to see statistics.";
                return model;
            }
            using (contexts.EnsureUmbracoContext())
            {
                var content = query.Content(id);
                if (content is null)
                {
                    model.Message = "This page is not published, so it has no address to count views for.";
                    return model;
                }
                model.Paths = stats.PathsFor(content);
            }
            try
            {
                var views = await stats.ViewsAsync(model.Paths, days, ct);
                model.Total = views.Total;
                model.Days = views.Days;
            }
            catch (HttpRequestException e)
            {
                model.Message = $"GoatCounter could not be read: {e.Message}";
            }
            return model;
        }
    }
}
