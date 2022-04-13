# Zuckr

> Du bist doch nicht aus Zucker!

**Doch, doch genau das bin ich kleiner Süsboy**

## So what does it do?

It is basically a clone of the increasingly defunct app [RainToday](http://raintoday.weatherpro.de/lang/en.html) that I loved dearly for my outdoor activity planning. This app provided minute accurate precipitation predictions and showed you in a super simple user interface if it was going to rain in the next hour.

## Why? (tirade)

Since the data was based on the hyperlocal weather app [Dark Sky](https://darksky.net/) which shut down its [android app and API](https://arstechnica.com/gadgets/2021/06/ios-web-versions-of-dark-sky-weather-app-will-shut-down-in-2022/) it continues to work less and less even with old archived APKs (it was removed from the store a long time ago).

Just like all formerly good things which ever existed within neoliberalism it was destroyed by market greed. In this specific case [Apple bought Dark Sky](https://www.wired.com/story/apple-buys-dark-sky/) and put up its beautiful golden fence around the Apple™ walled garden of consoooomerism. (Do we actually have anti cartel legislation or did they dissolve every part of that after gotcha'ing Microsoft once in like the early 2000s 🤔).

In effect this means: **If you're not Apple then go f yourself. Look at the sky to see the weather or buy Apple products you poor peasant**.

## Technical

This is a [SvelteKit](https://kit.svelte.dev/) project with the static adapter [@sveltejs/adapter-static](https://github.com/sveltejs/kit/tree/master/packages/adapter-static) and [capacitor](https://capacitorjs.com/) for it to be exported as a mobile app.

The data is provided by OpenWeatherMap via its [One Call API](https://openweathermap.org/api/one-call-api) which allow you to get minutely weather prediction for the next hour. As the name certainly 100% suggests the service is not especially open and requires a [steep obolus](https://openweathermap.org/price) for the pleasure of using this API with a larger user base than hobbyists.
This works for me as a personal app right now but makes any kind of business distributing the app rather futile. Consumers don't pay for software and I don't think they would like to pay enough monthly to recoup the cost for an API developer plan (or even bigger ones).

## Prerequisite for compiling/developing yourself

Copy `src/constants.ts.example` to `src/constants.ts` and edit the value of `OPENWEATHERMAP_API_KEY` to your own free plan API key.

## Web instructions

### Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

To create a production web version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Mobile

### IOS

idk use dark sky?

JK but I don't own a mac and Apple developer accounts to check this out.
But may look at the [Capacitor iOS docs](https://capacitorjs.com/docs/ios) and drop a PR.

### Android

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start the app on your mobile phone which should be connected via ADB.

Then run

```bash
npm run build
npx cap sync
npx run android
```

You can also develop it with hot module reload by editing the `capacitor.config.ts` and commenting in the server part, editing the IP-Address to the one of your computer and running a svelte Kit dev server with `npm run dev`.
