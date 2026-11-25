<!--
    The bottom bar (APP-1.1): Home, the pin board, and Modules, the grid of modules and tools. Search joins them in
    M03.
-->
<script lang="ts">
    import { page } from '$app/state';
    import { resolve } from '$app/paths';

    // A tab is current on its own screen; a module's list or card belongs to Modules, and Settings and Not found to
    // neither.
    const current = $derived(
        page.error
            ? undefined
            : page.url.pathname === '/'
              ? 'home'
              : page.url.pathname === '/settings'
                ? undefined
                : 'modules'
    );
</script>

<nav aria-label="Main">
    <a href={resolve('/')} aria-current={current === 'home' ? 'page' : undefined}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" />
        </svg>
        Home
    </a>
    <a href={resolve('/modules')} aria-current={current === 'modules' ? 'page' : undefined}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
        </svg>
        Modules
    </a>
</nav>

<style>
    nav {
        position: fixed;
        inset: auto 0 0;
        z-index: 1;
        display: flex;
        justify-content: center;
        background: var(--surface);
        border-top: 1px solid var(--line);
        padding: 0 env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
    }

    a {
        display: grid;
        justify-items: center;
        align-content: center;
        gap: 2px;
        flex: 0 1 10rem;
        min-height: 56px;
        color: var(--muted);
        font-size: var(--text-xs);
        font-weight: 600;
        text-decoration: none;
    }

    a[aria-current='page'] {
        color: var(--accent);
    }

    svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
    }
</style>
