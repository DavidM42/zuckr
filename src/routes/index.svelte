<script lang="ts">
	import { App } from '@capacitor/app';
	import { Geolocation, type Position } from '@capacitor/geolocation';

	import { onMount } from 'svelte';
	import { Circle } from 'svelte-loading-spinners';
	import Chart from 'svelte-frappe-charts';

	import { wetWeatherCodes } from '../definitions/weatherCodes';
	import { rainMmToSeverity } from '../logic/utils';

	// TODO do not expose to client, make api proxy route
	import { OPENWEATHERMAP_API_KEY } from '../constants';

	let loc: Position;

	let weatherRequest: Promise<any> = new Promise(() => {});
	let lastWeatherRequestDate = new Date();

	// weather condition codes here:
	// https://openweathermap.org/weather-conditions

	async function getCurrentPosition() {
		try {
			const res = await Geolocation.getCurrentPosition();
			loc = res;
		} catch (e) {
			console.log(e);
			// alert('Geolocation failed for some reason. Will revert to Fulda as fallback for now')
			console.warn('Geolocation failed for some reason. Will revert to Fulda as fallback for now');
			loc = {
				coords: {
					latitude: 50.55009,
					longitude: 9.698879
					// latitude: "Couldn't get location data",
					// longitude: "Couldn't get location data"
				} as any
			} as any;
		} finally {
			return loc;
		}
	}

	async function getWeatherInfo() {
		try {
			const loc = await getCurrentPosition();
			const json = await (
				await fetch(
					`https://api.openweathermap.org/data/2.5/onecall?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&units=metric&exclude=hourly,daily,alerts&appid=${OPENWEATHERMAP_API_KEY}`
				)
			).json();
			lastWeatherRequestDate = new Date();

			if (!json.current?.weather[0]?.id || json.minutely?.length === 0) {
				throw new Error('Could not get weather data');
			}

			// TODO eventually check all not just first weather item
			const currentWeatherId = json.current.weather[0].id;
			const currentWeatherIcon = json.current.weather[0].icon;
			const precipitationHappening = wetWeatherCodes.includes(currentWeatherId);

			let precipitationStartAt = undefined;
			let precipitationEndAt = undefined;

			if (precipitationHappening) {
				for (let i = 0; i < json.minutely?.length; i++) {
					const minutelyForecast = json.minutely[i];
					if (minutelyForecast.precipitation === 0) {
						precipitationEndAt = new Date(minutelyForecast.dt * 1000);
						break;
					}
				}
			} else {
				for (let i = 0; i < json.minutely?.length; i++) {
					const minutelyForecast = json.minutely[i];
					if (minutelyForecast.precipitation > 0) {
						precipitationStartAt = new Date(minutelyForecast.dt * 1000);
						break;
					}
				}
			}

			// TODO remove test value
			// json.minutely[30].precipitation = 2.5;

			let chartData = {
				labels: json.minutely.map((minutelyForecast) => {
					const date = new Date(minutelyForecast.dt * 1000);
					return date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
				}),

				datasets: [
					{
						values: Array.from(
							json.minutely.map((minutelyForecast) => minutelyForecast.precipitation)
						)
					}
				],

				// yRegions: [
				// {
				// 	label: 'Leicht',
				// 	start: 0,
				// 	end: 2.5,
				// 	options: { labelPos: 'left' }
				// },
				// {
				// 	label: 'Mittel',
				// 	start: 2.501,
				// 	end: 7.6,
				// 	options: { labelPos: 'left' }
				// },
				// {
				// 	label: 'Stark',
				// 	start: 7.601,
				// 	end: 50,
				// 	options: { labelPos: 'left' }
				// }
				// ],
				yMarkers: [
					{
						label: 'Leicht',
						value: 0,
						options: { labelPos: 'left' }
					},
					{
						label: 'Mittel',
						value: 2.5,
						options: { labelPos: 'left' }
					},
					{
						label: 'Stark',
						value: 7.6,
						options: { labelPos: 'left' }
					}
				]
			};

			// thx https://stackoverflow.com/a/56461944
			const roundDownTo = (roundTo) => (x) => Math.floor(x / roundTo) * roundTo;
			const roundDownTo5Minutes = roundDownTo(1000 * 60 * 5);
			const roundTimeBefore = new Date(roundDownTo5Minutes(new Date(json.minutely[0].dt * 1000)));

			// TODO this creates a mismatch in order of time and data I think
			// chartData.datasets.values;
			chartData.labels.unshift(roundTimeBefore.getHours() + ':' + roundTimeBefore.getMinutes());

			console.log(chartData);

			const returnData = {
				precipitationHappening: precipitationHappening,
				precipitationStartAt: precipitationStartAt,
				precipitationEndAt: precipitationEndAt,
				currentTemp: Math.round(json.current.temp),
				weatherIconUrl: `https://openweathermap.org/img/wn/${currentWeatherIcon}@4x.png`,
				chartData: chartData
			};
			// TODO remove this test value
			// returnData.precipitationStartAt = null;
			console.log(returnData);
			return returnData;
		} catch (e) {
			console.error(e);
		}
	}

	function minutesUntilDate(target: Date) {
		console.log(target.getTime() - new Date().getTime());
		return Math.round((target.getTime() - new Date().getTime()) / 60000);
	}

	onMount(() => {
		// await Geolocation.watchPosition({}, (location) => loc = location);
		// getWeatherInfo();
		weatherRequest = getWeatherInfo();

		App?.addListener('appStateChange', ({ isActive }) => {
			const minutesSinceLastRequest = Math.round(
				(new Date().getTime() - lastWeatherRequestDate.getTime()) / 60000
			);

			// refresh on app changing to foreground and current data being older than 5 minutes
			if (isActive && minutesSinceLastRequest > 5) {
				weatherRequest = getWeatherInfo();
			}
		});
	});
</script>

<div id="container">
	{#await weatherRequest}
		<Circle size="150" color="#98d47c" unit="px" duration="0.7s" />
	{:then weatherInfo}
		<div id="radar">
			{#if weatherInfo.precipitationHappening}
				{#if weatherInfo.precipitationEndAt}
					<span>Regen endet in</span>
					<div class="circle timeTo">
						<span class="value">{minutesUntilDate(weatherInfo.precipitationEndAt)}</span>
						<span>min</span>
					</div>
				{:else}
					<span>Noch mindestens 60 Minuten Regen</span>
				{/if}
			{:else if weatherInfo.precipitationStartAt}
				<span>Regen beginnt in</span>
				<div class="circle timeTo">
					<span class="value">{minutesUntilDate(weatherInfo.precipitationStartAt)}</span>
					<span>min</span>
				</div>
			{:else}
				<span>Kein Regen in den nächsten 60 Minuten</span>
				<div class="circle weather">
					<img src={weatherInfo.weatherIconUrl} alt="current weather condition icon" />
					<span class="value">{weatherInfo.currentTemp}°C</span>
				</div>
			{/if}
			<span />
		</div>
		<div class="hLine" />
		<div id="graph">
			<span>Ausblick</span>
			<Chart
				data={weatherInfo.chartData}
				lineOptions={{ hideDots: 1, dotSize: 2 }}
				axisOptions={{ xIsSeries: true }}
				tooltipOptions={{
					formatTooltipY: (d) => `${d}mm (${rainMmToSeverity(d)})`
				}}
				type="line"
			/>
		</div>
	{:catch error}
		<p style="color: red">Wetterdaten nicht verfügbar</p>
	{/await}
</div>

<style lang="scss">
	@media (prefers-color-scheme: dark) {
		:global(body) {
			background: #333;
			color: #fff;
		}
	}

	@media (prefers-color-scheme: light) {
		// for light mode definitions
	}

	#container {
		display: flex;
		flex-direction: column;
		align-items: center;

		padding-top: 10%;

		& > #radar {
			height: 45vh;
			width: 100%;

			display: flex;
			flex-direction: column;
			justify-content: space-between;
			text-align: center;
			align-items: center;

			& > .circle {
				color: #fff;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				border-radius: 100px;
				background-color: $blue-accent-color;

				&.timeTo {
					width: 100px;
					height: 100px;
				}

				&.weather {
					width: 200px;
					height: 200px;

					> img {
						width: 60%;
						height: 60%;
					}
				}

				& > .value {
					font-size: 2em;
					font-weight: bold;
				}
			}
		}

		& > .hLine {
			width: 100%;
			height: 1px;
			background-color: #333;
		}

		& > #graph {
			/* height: 45vh; */
			width: 100%;
			padding-top: 10px;

			display: flex;
			flex-direction: column;
			text-align: center;

			background: #fff;
			border-radius: 10px;
		}
	}
</style>
