<!-- One of a few options, as a row of buttons: a radio group under a legend. -->
<script lang="ts" generics="T extends string">
    interface Option {
        readonly value: T;
        readonly label: string;
    }

    interface Props {
        legend: string;
        /** The radio group's name, unique on the page. */
        name: string;
        options: readonly Option[];
        value: T;
        /** Lays the options out in this many equal columns, rather than wrapping them in a row. */
        columns?: number;
        onchange: (value: T) => void;
    }

    let { legend, name, options, value, columns, onchange }: Props = $props();
</script>

<fieldset>
    <legend>{legend}</legend>
    <div
        class="options"
        class:columns={columns !== undefined}
        style:grid-template-columns={columns === undefined ? undefined : `repeat(${String(columns)}, 1fr)`}
    >
        {#each options as option (option.value)}
            <label class:chosen={option.value === value}>
                <input
                    type="radio"
                    {name}
                    value={option.value}
                    checked={option.value === value}
                    onchange={() => onchange(option.value)}
                />
                {option.label}
            </label>
        {/each}
    </div>
</fieldset>

<style>
    fieldset {
        margin: 0;
        padding: 0;
        border: 0;
        min-width: 0;
    }

    legend {
        padding: 0;
        margin-bottom: 8px;
        font-weight: 600;
    }

    .options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .options.columns {
        display: grid;
    }

    .columns label {
        padding: 0 4px;
    }

    label {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: var(--tap);
        min-width: var(--tap);
        padding: 0 14px;
        text-align: center;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-2);
        font-size: var(--text-m);
        cursor: pointer;
    }

    label.chosen {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-ink);
        font-weight: 600;
    }

    label:has(:focus-visible) {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
    }

    input {
        position: absolute;
        opacity: 0;
        width: 1px;
        height: 1px;
        margin: 0;
    }
</style>
