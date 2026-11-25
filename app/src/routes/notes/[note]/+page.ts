import { cardLoad } from '#lib/url/load.ts';
import { readNoteCard } from '#lib/url/routes.ts';
import type { PageLoad } from './$types';

// Drawn in the browser from the fallback page, not prerendered: there's one for every root (architecture's Routes).
export const prerender = false;
export const ssr = false;

export const load: PageLoad = ({ params, url }) => cardLoad(readNoteCard(params.note), url);
