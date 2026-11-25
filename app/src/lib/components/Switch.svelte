<!-- An on/off setting: a checkbox shown as a switch, with its label to the left. -->
<script lang="ts">
    interface Props {
        label: string;
        checked: boolean;
        onchange: (checked: boolean) => void;
    }

    let { label, checked, onchange }: Props = $props();
</script>

<label>
    <span>{label}</span>
    <input type="checkbox" role="switch" {checked} onchange={event => onchange(event.currentTarget.checked)} />
</label>

<style>
    label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: var(--tap);
        font-weight: 600;
        cursor: pointer;
    }

    input {
        appearance: none;
        position: relative;
        flex: none;
        width: 52px;
        height: 32px;
        margin: 0;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: var(--surface-2);
        cursor: pointer;
    }

    input::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--muted);
    }

    input:checked {
        background: var(--accent);
        border-color: var(--accent);
    }

    input:checked::after {
        left: 23px;
        background: var(--accent-ink);
    }

    @media (prefers-reduced-motion: no-preference) {
        input::after {
            transition: left 0.15s;
        }
    }
</style>
