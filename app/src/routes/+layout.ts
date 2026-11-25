// A static site: every route is prerendered to HTML at build time (adapter-static), except the cards, which turn it off
// and are drawn in the browser from the fallback page (architecture's Routes).
export const prerender = true;
