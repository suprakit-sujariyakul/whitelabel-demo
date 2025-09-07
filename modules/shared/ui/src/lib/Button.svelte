<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		onClick: () => void;
	}

	let { children, onClick }: Props = $props();
</script>

<button class="button" onclick={onClick}>
	{@render children?.()}
</button>
