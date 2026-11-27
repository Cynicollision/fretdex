<!--
    A small bottom sheet (a modal `<dialog>`) with a heading and Done, closed by Done, Escape or a tap outside it, or
    by its owner setting `open` false: a pin's choices (PIN-1.2) and a tile's menu (PIN-2.3). A sheet that only
    leads elsewhere, as the menu does, has ✕ in place of Done, as there's nothing to be done with.
-->
<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        open: boolean;
        title: string;
        onclose: () => void;
        /** ✕ (named Close) in place of Done. */
        closeIcon?: boolean;
        children: Snippet;
    }

    let { open, title, onclose, closeIcon = false, children }: Props = $props();

    let dialog: HTMLDialogElement | undefined = $state();
    const id = $props.id();

    $effect(() => {
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
    });

    function close() {
        dialog?.close();
    }

    // A tap on the backdrop closes it; as in the context sheet, only when the press started and ended outside.
    let pressedOutside = false;

    function outside(event: MouseEvent): boolean {
        if (event.target !== dialog || !dialog) return false;
        const box = dialog.getBoundingClientRect();
        return (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
        );
    }

    function backdropClick(event: MouseEvent) {
        if (pressedOutside && outside(event)) close();
        pressedOutside = false;
    }
</script>

<dialog
    bind:this={dialog}
    aria-labelledby="{id}-title"
    {onclose}
    onpointerdown={(event: PointerEvent) => (pressedOutside = outside(event))}
    onclick={backdropClick}
>
    {#if open}
        <div class="sheet">
            <header>
                <h2 id="{id}-title">{title}</h2>
                {#if closeIcon}
                    <button type="button" class="done icon" aria-label="Close" onclick={close}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                    </button>
                {:else}
                    <button type="button" class="done" onclick={close}>Done</button>
                {/if}
            </header>
            {@render children()}
        </div>
    {/if}
</dialog>

<style>
    dialog {
        width: 100%;
        max-width: 40rem;
        max-height: 92dvh;
        margin: auto auto 0;
        padding: 0;
        border: 1px solid var(--line);
        border-bottom: 0;
        border-radius: var(--radius) var(--radius) 0 0;
        background: var(--surface);
        color: var(--text);
        box-sizing: border-box;
    }

    dialog::backdrop {
        background: var(--backdrop);
    }

    .sheet {
        display: grid;
        gap: 16px;
        padding: 16px max(16px, env(safe-area-inset-right, 0px)) max(24px, env(safe-area-inset-bottom, 0px))
            max(16px, env(safe-area-inset-left, 0px));
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    h2 {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    .done {
        flex: none;
        min-height: var(--tap);
        min-width: var(--tap);
        padding: 0 14px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        color: var(--text);
        font: inherit;
        font-size: var(--text-m);
        font-weight: 600;
        cursor: pointer;
    }

    .icon {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        padding: 0;
    }

    .icon svg {
        width: 22px;
        height: 22px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.25;
        stroke-linecap: round;
    }
</style>
