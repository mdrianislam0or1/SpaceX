<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { LandingPad } from '$lib/types';

	export let landingPads: LandingPad[] = [];

	let chartCanvas: HTMLCanvasElement;
	let chart: Chart<'doughnut', number[], string>;

	function calculateSuccessRate(pad: LandingPad): number {
		if (!pad.attempted_landings || pad.attempted_landings === 0) return 0;
		return (pad.successful_landings / pad.attempted_landings) * 100;
	}

	function createChart() {
		const ctx = chartCanvas.getContext('2d');
		if (!ctx) return;

		const data = {
			labels: landingPads.map((pad) => pad.location.name),
			datasets: [
				{
					data: landingPads.map((pad) => calculateSuccessRate(pad)),
					backgroundColor: ['#EC4899', '#4C6EF5', '#06B6D4', '#FFA07A', '#22C55E', '#EAB308'],
					borderWidth: 0
				}
			]
		};
		chart = new Chart(ctx, {
			type: 'doughnut',
			data,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '75%',
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label: (context) => `Success Rate: ${context.formattedValue}%`
						}
					}
				}
			}
		});
	}

	function updateChart() {
		if (chart) {
			chart.data.labels = landingPads.map((pad) => pad.location.name);
			chart.data.datasets[0].data = landingPads.map((pad) => calculateSuccessRate(pad));
			chart.update();
		}
	}

	onMount(() => {
		createChart();
	});

	$: {
		if (chart && landingPads) {
			updateChart();
		}
	}
</script>

<div class="rounded-lg bg-white p-6 shadow-sm">
	<h2 class="mb-4 text-lg font-medium">Success Rate Chart</h2>
	<div class="relative h-[300px]">
		<canvas bind:this={chartCanvas}></canvas>
		<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
			<span class="text-3xl font-semibold">{landingPads.length}</span>
			<span class="text-gray-500">Landing Pads</span>
		</div>
	</div>
</div>

<style>
	canvas {
		width: 100% !important;
		height: 100% !important;
	}
</style>
