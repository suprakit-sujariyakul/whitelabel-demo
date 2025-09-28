<script lang="ts">
	import { LobbyPage } from '$plugin/lobby';
	import { m } from '$lib/paraglide/messages';
</script>

<LobbyPage 
	currentUser={{
		username: 'John',
		status: 'online',
		joinDate: new Date('2024-01-01')
	}}
	messages={{
		title: m.lobby_title(),
		settings: m.lobby_settings(),
		logout: m.lobby_logout(),
		yourProfile: m.lobby_your_profile(),
		playingAsGuest: m.lobby_playing_as_guest(),
		createAccount: m.lobby_create_account(),
		onlinePlayersCount: m.lobby_online_players_count,
		availableRooms: m.lobby_available_rooms(),
		createRoom: m.lobby_create_room(),
		joinRoom: m.lobby_join_room(),
		spectate: m.lobby_spectate(),
		noRoomsAvailable: m.lobby_no_rooms_available(),
		private: m.lobby_private(),
		players: m.lobby_players(),
		joined: m.lobby_joined,
		statusOnline: m.lobby_status_online(),
		statusAway: m.lobby_status_away(),
		statusOffline: m.lobby_status_offline()
	}}
/>
