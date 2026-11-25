<!--
    A screen's back control (APP-1.3): back through the browser's history to where the user came from in the app, or,
    with nothing there (a card opened from a link or a shortcut), to `href`, usually the card's module list.
-->
<script lang="ts">
    import { goBack } from '#lib/url/navigate.ts';
    import { resolve } from '$app/paths';
    import type { ScreenPath } from '#lib/url/routes.ts';

    interface Props {
        /** Where to go when there's nothing to go back to. */
        href: ScreenPath;
    }

    let { href }: Props = $props();

    function back(event: MouseEvent) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (goBack()) event.preventDefault();
    }
</script>

<a class="back" href={resolve(href)} onclick={back}>‹ Back</a>

<style>
    .back {
        display: inline-flex;
        align-items: center;
        min-height: var(--tap);
        min-width: var(--tap);
        justify-self: start;
        color: var(--accent);
        font-size: var(--text-m);
        text-decoration: none;
    }
</style>
