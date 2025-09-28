<script lang="ts">
	import { Button } from '@shared/ui';

	interface LobbyMessages {
		title: string;
		settings: string;
		logout: string;
		yourProfile: string;
		playingAsGuest: string;
		createAccount: string;
		onlinePlayersCount: (params: { count: number }) => string;
		availableRooms: string;
		createRoom: string;
		joinRoom: string;
		spectate: string;
		noRoomsAvailable: string;
		private: string;
		players: string;
		joined: (params: { date: string }) => string;
		statusOnline: string;
		statusAway: string;
		statusOffline: string;
	}

	interface Props {
		currentUser?: {
			username: string;
			avatar?: string;
			status: 'online' | 'away' | 'offline';
			joinDate?: Date;
		};
		messages: LobbyMessages;
	}

	let { currentUser, messages }: Props = $props();
</script>

<!-- CLIENT-A CUSTOM LOBBY PAGE -->
<div class="client-a-lobby">
	<header class="custom-header">
		<div class="header-content">
			<h1 class="custom-title">🎮 {messages.title} - Client A Edition</h1>
			<div class="header-actions">
				<Button variant="outline">{messages.settings}</Button>
				<Button variant="secondary">{messages.logout}</Button>
			</div>
		</div>
	</header>

	<main class="custom-main">
		<div class="welcome-banner">
			<h2>🌟 Welcome to Client A's Premium Gaming Lobby! 🌟</h2>
			<p>This is a custom lobby page specifically designed for Client A.</p>
			<p>Notice how this completely overrides the default lobby page!</p>
		</div>

		<div class="features-grid">
			<div class="feature-card">
				<h3>🎯 Custom Features</h3>
				<ul>
					<li>Client A Branding</li>
					<li>Premium UI Design</li>
					<li>Custom Color Scheme</li>
					<li>Enhanced User Experience</li>
				</ul>
			</div>

			<div class="feature-card">
				<h3>🎮 Gaming Options</h3>
				<ul>
					<li>Exclusive Game Modes</li>
					<li>VIP Room Access</li>
					<li>Priority Matchmaking</li>
					<li>Custom Tournaments</li>
				</ul>
			</div>

			<div class="feature-card">
				<h3>👥 Community</h3>
				<ul>
					<li>Client A Members Only</li>
					<li>Premium Support</li>
					<li>Exclusive Events</li>
					<li>Special Rewards</li>
				</ul>
			</div>
		</div>

		<div class="user-section">
			{#if currentUser}
				<div class="current-user">
					<h3>{messages.yourProfile}</h3>
					<p>Welcome back, {currentUser.username}! 👋</p>
					<p>Status: {currentUser.status}</p>
				</div>
			{:else}
				<div class="guest-user">
					<h3>{messages.playingAsGuest}</h3>
					<button class="btn-primary">{messages.createAccount}</button>
				</div>
			{/if}
		</div>

		<div class="action-buttons">
			<button class="btn-primary btn-large">🎮 Start Gaming</button>
			<button class="btn-outline btn-large">📊 View Stats</button>
			<button class="btn-secondary btn-large">⚙️ Preferences</button>
		</div>
	</main>
</div>

<style>
	.client-a-lobby {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-family: 'Arial', sans-serif;
	}

	.custom-header {
		background: rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(10px);
		padding: 1rem 2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
	}

	.custom-title {
		font-size: 2rem;
		font-weight: bold;
		margin: 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
	}

	.header-actions {
		display: flex;
		gap: 1rem;
	}

	.custom-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.welcome-banner {
		text-align: center;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 15px;
		margin-bottom: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.welcome-banner h2 {
		font-size: 1.8rem;
		margin-bottom: 1rem;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
	}

	.welcome-banner p {
		font-size: 1.1rem;
		margin: 0.5rem 0;
		opacity: 0.9;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.feature-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		padding: 1.5rem;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.feature-card h3 {
		font-size: 1.3rem;
		margin-bottom: 1rem;
		color: #ffd700;
	}

	.feature-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.feature-card li {
		padding: 0.3rem 0;
		opacity: 0.9;
	}

	.feature-card li::before {
		content: "✨ ";
		margin-right: 0.5rem;
	}

	.user-section {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		padding: 1.5rem;
		border-radius: 10px;
		margin-bottom: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.user-section h3 {
		color: #ffd700;
		margin-bottom: 1rem;
	}

	.action-buttons {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	/* Basic button styles */
	button {
		padding: 0.5rem 1rem;
		border: 1px solid #ccc;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.btn-primary:hover {
		background: #2563eb;
	}

	.btn-outline {
		background: transparent;
		color: #3b82f6;
		border-color: #3b82f6;
	}

	.btn-outline:hover {
		background: #3b82f6;
		color: white;
	}

	.btn-secondary {
		background: #6b7280;
		color: white;
		border-color: #6b7280;
	}

	.btn-secondary:hover {
		background: #4b5563;
	}

	.btn-large {
		padding: 0.75rem 1.5rem;
		font-size: 1.125rem;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: 1rem;
		}

		.custom-title {
			font-size: 1.5rem;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.action-buttons {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
