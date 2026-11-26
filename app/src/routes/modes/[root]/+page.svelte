<script lang="ts">
    import ModesOverview from '#lib/components/ModesOverview.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<ModesOverview root={data.card.root} />
