<script lang="ts">
    import CardSketch from '#lib/components/CardSketch.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<CardSketch card={data.card} />
