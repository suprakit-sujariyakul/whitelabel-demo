<script lang="ts">
	import { ScreeningPage } from '@core/auth';
	import { m } from '$lib/paraglide/messages';
</script>

<ScreeningPage 
	title={m.common_hello_world({ name: 'John' })}
	subtitle="Join our team! Please complete this screening form to start your application process."
/>
