<!--
    About (APP-1.6): what Fretdex is, for someone who finds it with no other context, that it keeps nothing but on the
    device, and where its source, licence and credits are.
-->
<script lang="ts">
    import Screen from '#lib/components/Screen.svelte';

    const SOURCE = 'https://github.com/Cynicollision/fretdex';
</script>

<Screen title="About" back="/">
    <p>
        Fretdex is a reference for guitar and bass. It shows any scale or mode on any root, across the whole neck and in
        the positions players learn them in, in any tuning, with a capo, for either hand, and plays what it shows.
        Chords, keys and progressions are on the way.
    </p>
    <p>
        It's a web app that installs like any other: add it to your home screen, and it works with no connection, on a
        music stand or in a rehearsal room.
    </p>
    <p>
        There's no account, no tracking and no ads. Your settings, tunings and pins stay on this device, and Settings
        can save them to a file.
    </p>
    <p>
        Fretdex is free and open source, under the MIT licence. Its code, its plans and the credits for the libraries
        and fonts it uses are on GitHub:
        <a href={SOURCE} rel="external">github.com/Cynicollision/fretdex</a>.
    </p>
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
