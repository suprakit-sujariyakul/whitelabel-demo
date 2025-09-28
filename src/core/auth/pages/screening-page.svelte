<script lang="ts">
	import ScreeningForm from '../components/screening-form.svelte';

	interface Props {
		title?: string;
		subtitle?: string;
		showHeader?: boolean;
	}

	let { 
		title = "Application Screening", 
		subtitle = "Please fill out the form below to begin your application process",
		showHeader = true 
	}: Props = $props();
</script>

<div class="screening-page">
	{#if showHeader}
		<header class="page-header">
			<h1>{title}</h1>
			{#if subtitle}
				<p class="subtitle">{subtitle}</p>
			{/if}
		</header>
	{/if}

	<main class="page-content">
		<ScreeningForm />
	</main>

	<footer class="page-footer">
		<p class="help-text">
			Need help? Contact our support team at 
			<a href="mailto:support@example.com">support@example.com</a>
		</p>
	</footer>
</div>

<style>
	.screening-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1rem;
	}

	.page-header {
		text-align: center;
		padding: 2rem 0;
		color: white;
		margin-bottom: 1rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem 0;
		font-weight: 700;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.subtitle {
		font-size: 1.2rem;
		margin: 0;
		opacity: 0.9;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.5;
	}

	.page-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem 0;
	}

	.page-footer {
		text-align: center;
		padding: 1rem 0;
		color: white;
		opacity: 0.8;
	}

	.help-text {
		margin: 0;
		font-size: 0.9rem;
	}

	.help-text a {
		color: #ffd700;
		text-decoration: none;
		font-weight: 500;
	}

	.help-text a:hover {
		text-decoration: underline;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.screening-page {
			padding: 0.5rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.page-content {
			padding: 0.5rem 0;
		}
	}

	/* Dark mode override for the form background */
	:global(.screening-page .screening-form) {
		background: white;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		max-width: 700px;
		width: 100%;
	}
</style>