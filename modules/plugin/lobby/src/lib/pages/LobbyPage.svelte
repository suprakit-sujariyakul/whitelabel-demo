<script lang="ts">
	import { Button } from '@shared/ui';
	import UserCard from '../components/UserCard.svelte';
	import RoomList from '../components/RoomList.svelte';

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

	// Mock data for demonstration
	const mockRooms = [
		{
			id: '1',
			name: 'Casual Game Night',
			playerCount: 3,
			maxPlayers: 6,
			gameType: 'Board Game',
			isPrivate: false
		},
		{
			id: '2',
			name: 'Tournament Match',
			playerCount: 8,
			maxPlayers: 8,
			gameType: 'Strategy',
			isPrivate: false
		},
		{
			id: '3',
			name: 'Friends Only',
			playerCount: 2,
			maxPlayers: 4,
			gameType: 'Card Game',
			isPrivate: true
		}
	];

	const mockOnlineUsers = [
		{
			username: 'Alex',
			status: 'online' as const,
			joinDate: new Date('2024-01-15')
		},
		{
			username: 'Sarah',
			status: 'away' as const,
			joinDate: new Date('2024-02-20')
		},
		{
			username: 'Mike',
			status: 'online' as const,
			joinDate: new Date('2024-03-10')
		}
	];

	function handleJoinRoom(roomId: string) {
		console.log('Joining room:', roomId);
		// Implementation would go here
	}

	function handleCreateRoom() {
		console.log('Creating new room');
		// Implementation would go here
	}

	function handleLogout() {
		console.log('Logging out');
		// Implementation would go here
	}

	function handleSettings() {
		console.log('Opening settings');
		// Implementation would go here
	}
</script>

<div class="lobby-page">
	<header class="lobby-header">
		<div class="header-content">
			<h1>{messages.title}</h1>
			<div class="header-actions">
				<Button variant="outline" onclick={handleSettings}>
					{messages.settings}
				</Button>
				<Button variant="secondary" onclick={handleLogout}>
					{messages.logout}
				</Button>
			</div>
		</div>
	</header>

	<main class="lobby-main">
		<div class="sidebar">
			<section class="current-user-section">
				<h2>{messages.yourProfile}</h2>
				{#if currentUser}
					<UserCard
						username={currentUser.username}
						avatar={currentUser.avatar}
						status={currentUser.status}
						joinDate={currentUser.joinDate}
						messages={{
							joined: messages.joined,
							statusOnline: messages.statusOnline,
							statusAway: messages.statusAway,
							statusOffline: messages.statusOffline
						}}
					/>
				{:else}
					<div class="guest-user">
						<p>{messages.playingAsGuest}</p>
						<Button variant="link" onclick={() => console.log('Sign up')}>
							{messages.createAccount}
						</Button>
					</div>
				{/if}
			</section>

			<section class="online-users-section">
				<h2>{messages.onlinePlayersCount({ count: mockOnlineUsers.length })}</h2>
				<div class="users-list">
					{#each mockOnlineUsers as user (user.username)}
						<UserCard
							username={user.username}
							status={user.status}
							joinDate={user.joinDate}
							messages={{
								joined: messages.joined,
								statusOnline: messages.statusOnline,
								statusAway: messages.statusAway,
								statusOffline: messages.statusOffline
							}}
						/>
					{/each}
				</div>
			</section>
		</div>

		<div class="main-content">
			<RoomList
				rooms={mockRooms}
				onJoinRoom={handleJoinRoom}
				onCreateRoom={handleCreateRoom}
				messages={{
					availableRooms: messages.availableRooms,
					createRoom: messages.createRoom,
					joinRoom: messages.joinRoom,
					spectate: messages.spectate,
					noRoomsAvailable: messages.noRoomsAvailable,
					private: messages.private,
					players: messages.players
				}}
			/>
		</div>
	</main>
</div>

<style>
	.lobby-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.lobby-header {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding: 1rem 0;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.lobby-header h1 {
		margin: 0;
		color: white;
		font-size: 2rem;
		font-weight: 700;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.header-actions {
		display: flex;
		gap: 1rem;
	}

	.lobby-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		display: grid;
		grid-template-columns: 350px 1fr;
		gap: 2rem;
		min-height: calc(100vh - 120px);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.current-user-section,
	.online-users-section {
		background: rgba(255, 255, 255, 0.95);
		padding: 1.5rem;
		border-radius: 1rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.current-user-section h2,
	.online-users-section h2 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
	}

	.guest-user {
		text-align: center;
		padding: 2rem 1rem;
		color: #6b7280;
	}

	.guest-user p {
		margin: 0 0 1rem 0;
	}

	.users-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.main-content {
		background: rgba(255, 255, 255, 0.95);
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 768px) {
		.lobby-main {
			grid-template-columns: 1fr;
			padding: 1rem;
		}
		
		.header-content {
			padding: 0 1rem;
		}
		
		.lobby-header h1 {
			font-size: 1.5rem;
		}
	}
</style>
