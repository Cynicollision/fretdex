import { cardLoad } from '#lib/url/load.ts';
import { readScaleCard } from '#lib/url/routes.ts';
import type { PageLoad } from './$types';

// Drawn in the browser from the fallback page, not prerendered: there's one for every root (architecture's Routes).
export const prerender = false;
export const ssr = false;

export const load: PageLoad = ({ params, url }) => cardLoad(readScaleCard(params.root, params.scale), url);
