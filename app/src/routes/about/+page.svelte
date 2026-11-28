<!--
    About (APP-1.6): what Fretdex is, in a few lines, with the rest on GitHub, and the credits.
-->
<script lang="ts">
    import Screen from '#lib/components/Screen.svelte';
    import { resolve } from '$app/paths';

    const SOURCE = 'https://github.com/Cynicollision/fretdex';
</script>

<Screen title="About" back="/">
    <p>
        Fretdex is a reference for guitar and bass that works offline: scales and modes in any key and tuning, with
        chords, keys and progressions on the way.
    </p>
    <p>
        It's free and open source, under the MIT licence. More about it is on GitHub:
        <a href={SOURCE} rel="external">github.com/Cynicollision/fretdex</a>.
    </p>
    <p>The libraries and fonts it uses are in <a href={resolve('/licences')}>Credits and licences</a>.</p>
</Screen>

<style>
    p {
        margin: 0;
        max-width: 34rem;
    }

    a {
        color: var(--accent);
    }
</style>
