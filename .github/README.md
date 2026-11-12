# GoatCounter

[![Downloads](https://img.shields.io/nuget/dt/Umbraco.Community.GoatCounter?color=cc9900)](https://www.nuget.org/packages/Umbraco.Community.GoatCounter/)
[![NuGet](https://img.shields.io/nuget/vpre/Umbraco.Community.GoatCounter?color=0273B3)](https://www.nuget.org/packages/Umbraco.Community.GoatCounter)
[![GitHub license](https://img.shields.io/github/license/AndyCross/umbraco-goatcounter?color=8AB803)](../LICENSE)

[GoatCounter](https://www.goatcounter.com) is a small, open source, privacy-friendly web analytics service. This package brings it into Umbraco 17:

- **A dashboard** in the Content section: views per day, most viewed pages, referrers, countries, browsers, systems and screen sizes, for the last 7, 30 or 90 days.
- **A Views tab on every page**, showing how often that page was viewed.
- **First-party counting.** Page views go to an endpoint on your own site, which passes them to GoatCounter. Blockers that know `gc.zgo.at` and `*.goatcounter.com` never see a request to them.

Your API keys stay on the server. The browser never talks to GoatCounter.

## Installation

```
dotnet add package Umbraco.Community.GoatCounter
```

## Configuration

```json
"GoatCounter": {
  "Site": "mysite",
  "Token": "an API key that can read statistics",
  "CountToken": "an API key that can record page views",
  "CountPageViews": true,
  "Hostnames": [ "example.com" ]
}
```

| Setting | What it does | Default |
|---|---|---|
| `Site` | Your GoatCounter code (`mysite` for mysite.goatcounter.com), or the full URL of a self-hosted GoatCounter | none |
| `Token` | API key for reading statistics. The dashboard needs it | none |
| `CountToken` | API key for recording page views. Falls back to `Token` | none |
| `CountPageViews` | Turns first-party counting on | `false` |
| `Route` | The path on your site the beacon is sent to | `/s` |
| `Hostnames` | Hosts that are counted. Empty means any host except localhost | empty |
| `CacheMinutes` | How long statistics are kept before GoatCounter is asked again | `5` |

Create API keys in GoatCounter under Settings, API. Keep them out of source control: use user secrets or environment variables (`GoatCounter__Token`).

Installing the package sends nothing. The dashboard appears once `Site` and `Token` are set, and counting starts only when `CountPageViews` is `true`.

## Counting page views

Add the beacon to your layout's `<head>`:

```cshtml
@using GoatCounter
@Html.GoatCounterBeacon()
```

It writes nothing on hosts you don't count, so development and staging sites stay silent. GoatCounter uses the visitor's IP address for sessions and location; if your site sits behind a proxy or CDN, configure ASP.NET Core's forwarded headers so the real address is passed on.

## Pages that have moved

A page's views are looked up under its URL. If a page used to live somewhere else, register an `IGoatCounterPathProvider` that returns its old paths, and the Views tab adds them together.

## Using the numbers in your own code

Inject `GoatCounterStats` for views by path (`ViewsByPathAsync`) or for a set of paths (`ViewsAsync`), for example to build a "most read" list.

<!--
Including screenshots is a really good idea! 

If you put images into /docs/screenshots, then you would reference them in this readme as, for example:

<img alt="..." src="https://github.com/AndyCross/umbraco-goatcounter/blob/develop/docs/screenshots/screenshot.png">

And don't forget to add the screenshot files to umbraco-marketplace.json too!
-->

## Installation

Add the package to an existing Umbraco website (v17+) from nuget:

`dotnet add package Umbraco.Community.GoatCounter`

TODO *provide any other instructions for someone using your package*

## Contributing

Contributions to this package are most welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md).

## Acknowledgments

TODO