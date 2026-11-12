using System.Threading.Channels;
using GoatCounter.Models;
using GoatCounter.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace GoatCounter.Counting;

/// <summary>
/// Page views wait here and go to GoatCounter in batches, so a visitor's request never waits on GoatCounter
/// and a busy minute is a few API calls, not hundreds. If GoatCounter is down the queue fills and new views are dropped.
/// </summary>
public class PageViewQueue : BackgroundService
{
    private readonly Channel<PageView> _channel = Channel.CreateBounded<PageView>(new BoundedChannelOptions(5000) { FullMode = BoundedChannelFullMode.DropWrite });
    private readonly IServiceScopeFactory _scopes;

    public PageViewQueue(IServiceScopeFactory scopes) => _scopes = scopes;

    public bool Add(PageView view) => _channel.Writer.TryWrite(view);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batch = new List<PageView>(100);
        while (await _channel.Reader.WaitToReadAsync(stoppingToken))
        {
            // Let a moment's worth gather, then send what is there.
            await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
            while (batch.Count < 100 && _channel.Reader.TryRead(out var view)) batch.Add(view);
            if (batch.Count == 0) continue;
            using var scope = _scopes.CreateScope();
            await scope.ServiceProvider.GetRequiredService<GoatCounterClient>().CountAsync(batch, stoppingToken);
            batch.Clear();
        }
    }
}
