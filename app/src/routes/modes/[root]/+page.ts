import { cardLoad } from '#lib/url/load.ts';
import { readModesCard } from '#lib/url/routes.ts';
import type { PageLoad } from './$types';

// Drawn in the browser from the fallback page, not prerendered, as the cards are (architecture's Routes).
export const prerender = false;
export const ssr = false;

export const load: PageLoad = ({ params, url }) => cardLoad(readModesCard(params.root), url);
