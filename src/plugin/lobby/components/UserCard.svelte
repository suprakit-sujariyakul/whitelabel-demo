<script lang="ts">
	interface Messages {
		joined: (params: { date: string }) => string;
		statusOnline: string;
		statusAway: string;
		statusOffline: string;
	}

	interface Props {
		username: string;
		avatar?: string;
		status: 'online' | 'away' | 'offline';
		joinDate?: Date;
		messages?: Messages;
	}

	let { username, avatar, status, joinDate, messages }: Props = $props();

	const getStatusText = (status: 'online' | 'away' | 'offline') => {
		if (!messages) return status;
		switch(status) {
			case 'online': return messages.statusOnline;
			case 'away': return messages.statusAway;
			case 'offline': return messages.statusOffline;
			default: return status;
		}
	};

	const statusColors = {
		online: '#10b981',
		away: '#f59e0b',
		offline: '#6b7280'
	};
</script>

<div class="user-card">
	<div class="avatar-container">
		{#if avatar}
			<img src={avatar} alt="{username}'s avatar" class="avatar" />
		{:else}
			<div class="avatar-placeholder">
				{username.charAt(0).toUpperCase()}
			</div>
		{/if}
		<div class="status-indicator" style="background-color: {statusColors[status]}"></div>
	</div>
	
	<div class="user-info">
		<h3 class="username">{username}</h3>
		<p class="status">{getStatusText(status)}</p>
		{#if joinDate}
			<p class="join-date">
				{messages ? messages.joined({ date: joinDate.toLocaleDateString() }) : `Joined ${joinDate.toLocaleDateString()}`}
			</p>
		{/if}
	</div>
</div>

<style>
	.user-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}

	.user-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.avatar-container {
		position: relative;
	}

	.avatar, .avatar-placeholder {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
	}

	.avatar {
		object-fit: cover;
	}

	.avatar-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-weight: bold;
		font-size: 1.25rem;
	}

	.status-indicator {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		border: 2px solid white;
	}

	.user-info {
		flex: 1;
	}

	.username {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.status {
		margin: 0.25rem 0;
		font-size: 0.875rem;
		color: #6b7280;
		text-transform: capitalize;
	}

	.join-date {
		margin: 0;
		font-size: 0.75rem;
		color: #9ca3af;
	}
</style>
