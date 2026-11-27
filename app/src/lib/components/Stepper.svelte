<!-- A whole number with − and + buttons either side, which can also be typed. Kept from min to max. -->
<script lang="ts">
    interface Props {
        label: string;
        value: number;
        min: number;
        max: number;
        /** Written after the number, such as "bpm". */
        unit?: string;
        onchange: (value: number) => void;
    }

    let { label, value, min, max, unit, onchange }: Props = $props();

    const id = $props.id();

    function set(next: number) {
        const clamped = Math.min(max, Math.max(min, Math.round(next)));
        if (clamped !== value) onchange(clamped);
    }

    function typed(event: Event & { currentTarget: HTMLInputElement }) {
        const input = event.currentTarget;
        const typedValue = input.valueAsNumber;
        if (Number.isNaN(typedValue)) input.value = String(value);
        else {
            set(typedValue);
            // Shows the kept value when what was typed was out of range.
            input.value = String(Math.min(max, Math.max(min, Math.round(typedValue))));
        }
    }
</script>

<div class="stepper">
    <label for={id}>{label}</label>
    <div class="controls">
        <button
            type="button"
            aria-label="Lower {label.toLowerCase()}"
            disabled={value <= min}
            onclick={() => set(value - 1)}
        >
            −
        </button>
        <input {id} type="number" inputmode="numeric" {min} {max} {value} onchange={typed} />
        <button
            type="button"
            aria-label="Raise {label.toLowerCase()}"
            disabled={value >= max}
            onclick={() => set(value + 1)}
        >
            +
        </button>
        {#if unit}<span class="unit">{unit}</span>{/if}
    </div>
</div>

<style>
    .stepper {
        display: grid;
        gap: 8px;
    }

    label {
        font-weight: 600;
    }

    .controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
    }

    button,
    input {
        min-height: var(--tap);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        color: var(--text);
        font: inherit;
        font-size: var(--text-m);
    }

    button {
        min-width: var(--tap);
        cursor: pointer;
    }

    button:disabled {
        color: var(--muted);
        cursor: default;
    }

    input {
        width: 4.5em;
        text-align: center;
        appearance: textfield;
    }

    input::-webkit-inner-spin-button,
    input::-webkit-outer-spin-button {
        appearance: none;
        margin: 0;
    }

    .unit {
        color: var(--muted);
    }
</style>
