<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Button,
		ButtonGroup,
		Dropdown,
		DropdownItem,
		Modal,
		Spinner,
		Progressbar
	} from 'flowbite-svelte';
	import { ListOutline, GridOutline, ChevronDownOutline, LinkOutline } from 'flowbite-svelte-icons';
	import Map from 'ol/Map';
	import View from 'ol/View';
	import TileLayer from 'ol/layer/Tile';
	import OSM from 'ol/source/OSM';
	import { fromLonLat } from 'ol/proj';
	import Feature from 'ol/Feature';
	import Point from 'ol/geom/Point';
	import { Vector as VectorLayer } from 'ol/layer';
	import { Vector as VectorSource } from 'ol/source';
	import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
	import type { LandingPad } from '$lib/types';
	import Chart from '$lib/components/Chart.svelte';

	let landingPads: LandingPad[] = [];
	let loading = true;
	let viewMode: 'list' | 'grid' = 'list';
	let showDetailsModal = false;
	let selectedPad: LandingPad | null = null;
	let map: Map;
	let filterStatus: string = 'all';

	async function fetchLandingPads() {
		try {
			const response = await fetch('https://api.spacexdata.com/v3/landpads');
			landingPads = await response.json();
			loading = false;
			initializeMap();
			updateMap();
		} catch (error) {
			console.error('Error fetching landing pads:', error);
			loading = false;
		}
	}

	function initializeMap() {
		map = new Map({
			target: 'map',
			layers: [new TileLayer({ source: new OSM() })],
			view: new View({
				center: fromLonLat([-80.6077, 28.6083]),
				zoom: 6
			})
		});
	}

	function updateMap() {
		if (!map) return;

		const features = filteredPads.map((pad) => {
			const feature = new Feature({
				geometry: new Point(fromLonLat([pad.location.longitude, pad.location.latitude]))
			});

			const color =
				pad.status === 'active' ? '#00B894' : pad.status === 'retired' ? '#FF6B6B' : '#4C6EF5';

			feature.setStyle(
				new Style({
					image: new CircleStyle({
						radius: 6,
						fill: new Fill({ color }),
						stroke: new Stroke({
							color: '#ffffff',
							width: 2
						})
					})
				})
			);

			return feature;
		});

		const vectorSource = new VectorSource({ features });
		const vectorLayer = new VectorLayer({ source: vectorSource });

		map
			.getLayers()
			.getArray()
			.filter((layer) => layer instanceof VectorLayer)
			.forEach((layer) => map.removeLayer(layer));

		map.addLayer(vectorLayer);
	}

	function calculateSuccessRate(pad: LandingPad): number {
		if (!pad.attempted_landings || pad.attempted_landings === 0) return 0;
		return (pad.successful_landings / pad.attempted_landings) * 100;
	}

	function handleFilterChange(status: string) {
		filterStatus = status;
		updateMap();
	}

	function showDetails(pad: LandingPad) {
		selectedPad = pad;
		showDetailsModal = true;
	}

	onMount(fetchLandingPads);

	$: filteredPads = landingPads.filter(
		(pad) => filterStatus === 'all' || pad.status === filterStatus
	);
</script>

<div class="min-h-screen bg-gray-50">
	<header class="border-b border-gray-200 bg-white">
		<div class="mx-auto flex max-w-[1200px] items-center justify-center px-6 py-4">
			<img src="/logo.png" alt="SpaceX" class="h-5" />
		</div>
	</header>

	<main class="mx-auto px-20 py-8">
		<div class="mb-6 flex items-center justify-between">
			<ButtonGroup class="gap-1">
				<Button
					color={viewMode === 'list' ? 'blue' : 'light'}
					on:click={() => (viewMode = 'list')}
					class="px-3 py-2"
				>
					<ListOutline class="h-5 w-5" />
				</Button>
				<Button
					color={viewMode === 'grid' ? 'blue' : 'light'}
					on:click={() => (viewMode = 'grid')}
					class="px-3 py-2"
				>
					<GridOutline class="h-5 w-5" />
				</Button>
			</ButtonGroup>

			<Dropdown placement="bottom-start">
				<Button color="light" class="w-[180px] justify-between">
					<div class="flex items-center gap-2">
						Filter By Status
						<ChevronDownOutline class="h-4 w-4" />
					</div>
				</Button>
				<DropdownItem on:click={() => (filterStatus = 'all')}>All</DropdownItem>
				<DropdownItem on:click={() => (filterStatus = 'active')}>
					<div class="flex items-center gap-2">
						<span class="h-2 w-2 rounded-full bg-[#00B894]"></span>
						Active
					</div>
				</DropdownItem>
				<DropdownItem on:click={() => (filterStatus = 'retired')}>
					<div class="flex items-center gap-2">
						<span class="h-2 w-2 rounded-full bg-[#FF6B6B]"></span>
						Retired
					</div>
				</DropdownItem>
				<DropdownItem on:click={() => (filterStatus = 'under_construction')}>
					<div class="flex items-center gap-2">
						<span class="h-2 w-2 rounded-full bg-[#4C6EF5]"></span>
						Under Construction
					</div>
				</DropdownItem>
			</Dropdown>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="col-span-2 overflow-x-auto">
				<div class="min-w-full rounded-lg bg-white shadow-sm">
					{#if loading}
						<div class="flex h-64 items-center justify-center">
							<Spinner />
						</div>
					{:else if viewMode === 'list'}
						<Table noborder={true} hoverable={true}>
							<TableHead>
								<TableHeadCell>Full Name</TableHeadCell>
								<TableHeadCell>Location Name</TableHeadCell>
								<TableHeadCell>Region</TableHeadCell>
								<TableHeadCell>Success Rate</TableHeadCell>
								<TableHeadCell>Wikipedia</TableHeadCell>
								<TableHeadCell>Status</TableHeadCell>
								<!-- <TableHeadCell>Details</TableHeadCell> -->
							</TableHead>
							<TableBody>
								{#each filteredPads as pad}
									<TableBodyRow on:click={() => showDetails(pad)}>
										<TableBodyCell>{pad.full_name}</TableBodyCell>
										<TableBodyCell>{pad.location.name}</TableBodyCell>
										<TableBodyCell>{pad.location.region}</TableBodyCell>
										<TableBodyCell>
											<div>
												<Progressbar progress={calculateSuccessRate(pad)} size="h-1.5" />
												<span>{calculateSuccessRate(pad).toFixed(1)}%</span>
											</div>
										</TableBodyCell>
										<TableBodyCell>
											<a
												href={pad.wikipedia}
												target="_blank"
												rel="noopener noreferrer"
												class="text-blue-600 hover:text-blue-800"
											>
												<LinkOutline class="h-4 w-4" />
											</a>
										</TableBodyCell>
										<TableBodyCell>
											<span
												class={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
													pad.status === 'active'
														? 'bg-green-100 text-green-800'
														: pad.status === 'retired'
															? 'bg-red-100 text-red-800'
															: 'bg-blue-100 text-blue-800'
												}`}
											>
												{pad.status}
											</span>
										</TableBodyCell>
									</TableBodyRow>
								{/each}
							</TableBody>
						</Table>
					{:else}
						<div class="grid grid-cols-2 gap-4 p-4">
							{#each filteredPads as pad}
								<div class="rounded-lg bg-gray-50 p-4">
									<h3 class="mb-2 font-medium">{pad.full_name}</h3>
									<p class="mb-2 text-sm text-gray-600">
										{pad.location.name}, {pad.location.region}
									</p>
									<div class="flex items-center justify-between">
										<span
											class={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
												pad.status === 'active'
													? 'bg-green-100 text-green-800'
													: pad.status === 'retired'
														? 'bg-red-100 text-red-800'
														: 'bg-blue-100 text-blue-800'
											}`}
										>
											{pad.status}
										</span>
										<Button on:click={() => showDetails(pad)} color="blue" size="xs"
											>View Details</Button
										>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<div class="col-span-1 space-y-6">
				<div class="rounded-lg bg-white shadow-sm">
					<h2 class="px-4 py-4 text-lg font-medium">Map View</h2>
					<div id="map" class="h-[300px] rounded-lg"></div>
				</div>

				<Chart {landingPads} />

				<!-- <div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-lg font-medium">Success Rate Chart</h2>
					<div class="flex h-[300px] items-center justify-center rounded-lg bg-gray-50">
						<p class="text-gray-500">
							Chart placeholder - implement with a chart library of your choice
						</p>
					</div>
				</div> -->
			</div>
		</div>
	</main>
</div>

{#if showDetailsModal}
	<Modal
		title={`Details - ${selectedPad?.full_name}`}
		on:close={() => (showDetailsModal = false)}
		open={showDetailsModal}
	>
		<div class="mt-2">
			<p class="text-sm text-gray-500">{selectedPad?.details}</p>
		</div>
		<div class="mt-4 grid grid-cols-2 gap-4">
			<div>
				<p class="font-medium">Status</p>
				<p class="text-gray-600">{selectedPad?.status}</p>
			</div>
			<div>
				<p class="font-medium">Success Rate</p>
				<p class="text-gray-600">
					{selectedPad ? calculateSuccessRate(selectedPad).toFixed(1) : 0}%
				</p>
			</div>
			<div>
				<p class="font-medium">Attempted Landings</p>
				<p class="text-gray-600">{selectedPad?.attempted_landings || 0}</p>
			</div>
			<div>
				<p class="font-medium">Successful Landings</p>
				<p class="text-gray-600">{selectedPad?.successful_landings || 0}</p>
			</div>
		</div>
	</Modal>
{/if}

<style>
	:global(.ol-control) {
		display: none;
	}
</style>
