<script lang="ts">
    import ScaleCard from '#lib/components/ScaleCard.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<ScaleCard card={data.card} />
