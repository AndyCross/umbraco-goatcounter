using Asp.Versioning;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using Microsoft.AspNetCore.Builder;
using GoatCounter.Counting;
using GoatCounter.Services;

namespace GoatCounter.Composers
{
    public class GoatCounterApiComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.Configure<GoatCounterOptions>(builder.Config.GetSection(GoatCounterOptions.Section));
            builder.Services.AddMemoryCache();
            builder.Services.AddHttpClient<GoatCounterClient>(c => c.Timeout = TimeSpan.FromSeconds(15));
            builder.Services.AddScoped<GoatCounterStats>();
            builder.Services.AddSingleton<IGoatCounterPathProvider, UrlPathProvider>();

            // The first-party counter: a queue that sends page views on in batches, and the endpoint the beacon calls.
            builder.Services.AddSingleton<PageViewQueue>();
            builder.Services.AddHostedService(s => s.GetRequiredService<PageViewQueue>());
            builder.Services.Configure<UmbracoPipelineOptions>(o => o.AddFilter(new UmbracoPipelineFilter("GoatCounter")
            {
                Endpoints = app => app.UseEndpoints(e =>
                {
                    var route = builder.Config.GetSection(GoatCounterOptions.Section)["Route"] is { Length: > 0 } r ? r : new GoatCounterOptions().Route;
                    e.MapGet(route, CountEndpoint.Handle);
                }),
            }));

            builder.Services.AddSingleton<IOperationIdHandler, CustomOperationHandler>();

            builder.Services.Configure<SwaggerGenOptions>(opt =>
            {
                // Related documentation:
                // https://docs.umbraco.com/umbraco-cms/tutorials/creating-a-backoffice-api
                // https://docs.umbraco.com/umbraco-cms/tutorials/creating-a-backoffice-api/adding-a-custom-swagger-document
                // https://docs.umbraco.com/umbraco-cms/tutorials/creating-a-backoffice-api/versioning-your-api
                // https://docs.umbraco.com/umbraco-cms/tutorials/creating-a-backoffice-api/access-policies

                // Configure the Swagger generation options
                // Add in a new Swagger API document solely for our own package that can be browsed via Swagger UI
                // Along with having a generated swagger JSON file that we can use to auto generate a TypeScript client
                opt.SwaggerDoc(Constants.ApiName, new OpenApiInfo
                {
                    Title = "Goat Counter Backoffice API",
                    Version = "1.0",
                    // Contact = new OpenApiContact
                    // {
                    //     Name = "Some Developer",
                    //     Email = "you@company.com",
                    //     Url = new Uri("https://company.com")
                    // }
                });

                // Enable Umbraco authentication for the "Example" Swagger document
                // PR: https://github.com/umbraco/Umbraco-CMS/pull/15699
                opt.OperationFilter<GoatCounterOperationSecurityFilter>();
            });
        }

        public class GoatCounterOperationSecurityFilter : BackOfficeSecurityRequirementsOperationFilterBase
        {
            protected override string ApiName => Constants.ApiName;
        }

        // Gives the operations of our own controllers the same operation IDs as the Management API, such as GetWhoAmI,
        // so the generated TypeScript client gets readable function names
        // https://docs.umbraco.com/umbraco-cms/tutorials/creating-a-backoffice-api/umbraco-schema-and-operation-ids#operation-ids
        public class CustomOperationHandler : OperationIdHandler
        {
            public CustomOperationHandler(IOptions<ApiVersioningOptions> apiVersioningOptions) : base(apiVersioningOptions)
            {
            }

            protected override bool CanHandle(ApiDescription apiDescription, ControllerActionDescriptor controllerActionDescriptor)
            {
                return controllerActionDescriptor.ControllerTypeInfo.Namespace?.StartsWith("GoatCounter.Controllers", comparisonType: StringComparison.InvariantCultureIgnoreCase) is true;
            }
        }
    }
}
