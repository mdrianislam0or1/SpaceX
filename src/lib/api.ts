import type { LandingPad } from './types';

export async function fetchLandingPads(): Promise<LandingPad[]> {
    const response = await fetch('https://api.spacexdata.com/v3/landpads');
    if (!response.ok) {
        throw new Error('Failed to fetch landing pads');
    }
    return response.json();
}