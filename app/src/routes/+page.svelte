<script lang="ts">
	import { ScreeningPage } from '@core/auth'; 
	import { Button } from '@shared/ui'; 
	import { m } from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';
	function navigateToLobby() {
		goto('/lobby');
	}
</script>

<ScreeningPage 
	title={m.common_hello_world({ name: 'John' })}
	subtitle="Join our team! Please complete this screening form to start your application process."
/>

{#if __IS_LOBBY_ENABLED__}
	<div class="lobby-section">
		<Button 
			variant="default" 
			size="lg"
			onclick={navigateToLobby}
		>
			🎮 {m.lobby_title()}
		</Button>
	</div>
{/if}

<style>
	.lobby-section {
		margin-top: 30px;
		padding: 20px;
		text-align: center;
		background-color: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}
</style>
