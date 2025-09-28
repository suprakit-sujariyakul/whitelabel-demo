<script lang="ts">
	import { Button } from '@shared/ui';

	interface Room {
		id: string;
		name: string;
		playerCount: number;
		maxPlayers: number;
		gameType: string;
		isPrivate?: boolean;
	}

	interface Messages {
		availableRooms: string;
		createRoom: string;
		joinRoom: string;
		spectate: string;
		noRoomsAvailable: string;
		private: string;
		players: string;
	}

	interface Props {
		rooms: Room[];
		onJoinRoom: (roomId: string) => void;
		onCreateRoom: () => void;
		messages: Messages;
	}

	let { rooms, onJoinRoom, onCreateRoom, messages }: Props = $props();
</script>

<div class="room-list">
	<div class="header">
		<h2>{messages.availableRooms}</h2>
		<Button variant="default" onclick={onCreateRoom}>
			{messages.createRoom}
		</Button>
	</div>

	{#if rooms.length === 0}
		<div class="empty-state">
			<p>{messages.noRoomsAvailable}</p>
		</div>
	{:else}
		<div class="rooms-grid">
			{#each rooms as room (room.id)}
				<div class="room-card">
					<div class="room-header">
						<h3 class="room-name">{room.name}</h3>
						{#if room.isPrivate}
							<span class="private-badge">🔒 {messages.private}</span>
						{/if}
					</div>
					
					<div class="room-details">
						<p class="game-type">{room.gameType}</p>
						<p class="player-count">
							{room.playerCount}/{room.maxPlayers} {messages.players}
						</p>
					</div>

					<div class="room-actions">
						<Button 
							variant={room.playerCount < room.maxPlayers ? "default" : "outline"}
							onclick={() => onJoinRoom(room.id)}
						>
							{room.playerCount < room.maxPlayers ? messages.joinRoom : messages.spectate}
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.room-list {
		width: 100%;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.header h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
	}

	.rooms-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.room-card {
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 1rem;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}

	.room-card:hover {
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		transform: translateY(-4px);
	}

	.room-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.room-name {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
	}

	.private-badge {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: #fef3c7;
		color: #92400e;
		border-radius: 0.375rem;
		font-weight: 500;
	}

	.room-details {
		margin-bottom: 1.5rem;
	}

	.game-type {
		margin: 0 0 0.5rem 0;
		font-size: 0.875rem;
		color: #374151;
		font-weight: 500;
	}

	.player-count {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.room-actions {
		display: flex;
		justify-content: flex-end;
	}
</style>
