<script lang="ts" module>
	import type { Snippet, HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

	export type ButtonProps = HTMLButtonAttributes & HTMLAnchorAttributes & {
		children: Snippet;
		variant?: ButtonVariant;
		size?: ButtonSize;
	};

	// Button variant styles
	const buttonVariants = {
		default: 'button button--primary',
		destructive: 'button button--danger',
		outline: 'button button--outline',
		secondary: 'button button--secondary',
		ghost: 'button button--ghost',
		link: 'button button--link'
	};

	const buttonSizes = {
		default: 'button--medium',
		sm: 'button--small',
		lg: 'button--large',
		icon: 'button--icon'
	};
</script>

<script lang="ts">
	let {
		children,
		variant = 'default',
		size = 'default',
		href,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		{href}
		class={[buttonVariants[variant], buttonSizes[size], restProps.class]}
		{...restProps}
	>
		{@render children()}
	</a>
{:else}
	<button
		type="button"
		class={[buttonVariants[variant], buttonSizes[size], restProps.class]}
		{...restProps}
	>
		{@render children()}
	</button>
{/if}

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		white-space: nowrap;
	}

	.button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Variants */
	.button--primary {
		background-color: #3b82f6;
		color: white;
	}

	.button--primary:hover:not(:disabled) {
		background-color: #2563eb;
	}

	.button--danger {
		background-color: #ef4444;
		color: white;
	}

	.button--danger:hover:not(:disabled) {
		background-color: #dc2626;
	}

	.button--outline {
		background-color: transparent;
		border: 1px solid #d1d5db;
		color: #374151;
	}

	.button--outline:hover:not(:disabled) {
		background-color: #f9fafb;
	}

	.button--secondary {
		background-color: #6b7280;
		color: white;
	}

	.button--secondary:hover:not(:disabled) {
		background-color: #4b5563;
	}

	.button--ghost {
		background-color: transparent;
		color: #374151;
	}

	.button--ghost:hover:not(:disabled) {
		background-color: #f3f4f6;
	}

	.button--link {
		background-color: transparent;
		color: #3b82f6;
		text-decoration: underline;
		padding: 0;
	}

	.button--link:hover:not(:disabled) {
		color: #2563eb;
	}

	/* Sizes */
	.button--small {
		height: 32px;
		padding: 0 12px;
		font-size: 14px;
	}

	.button--medium {
		height: 40px;
		padding: 0 16px;
		font-size: 16px;
	}

	.button--large {
		height: 48px;
		padding: 0 24px;
		font-size: 18px;
	}

	.button--icon {
		width: 40px;
		height: 40px;
		padding: 0;
	}
</style>
