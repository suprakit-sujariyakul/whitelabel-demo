<script lang="ts">
	import { Button } from '@shared/ui';
	
	interface ScreeningData {
		fullName: string;
		email: string;
		phone: string;
		experience: string;
		motivation: string;
	}

	let formData: ScreeningData = {
		fullName: '',
		email: '',
		phone: '',
		experience: '',
		motivation: ''
	};

	function handleSubmit() {
		console.log('Screening form submitted:', formData);
		// Add form submission logic here
	}

	function handleReset() {
		formData = {
			fullName: '',
			email: '',
			phone: '',
			experience: '',
			motivation: ''
		};
	}
</script>

<div class="screening-form">
	<h2>Screening Form</h2>
	
	<form on:submit|preventDefault={handleSubmit}>
		<div class="form-group">
			<label for="fullName">Full Name *</label>
			<input 
				id="fullName"
				type="text" 
				bind:value={formData.fullName}
				required 
			/>
		</div>

		<div class="form-group">
			<label for="email">Email Address *</label>
			<input 
				id="email"
				type="email" 
				bind:value={formData.email}
				required 
			/>
		</div>

		<div class="form-group">
			<label for="phone">Phone Number</label>
			<input 
				id="phone"
				type="tel" 
				bind:value={formData.phone}
			/>
		</div>

		<div class="form-group">
			<label for="experience">Relevant Experience</label>
			<textarea 
				id="experience"
				bind:value={formData.experience}
				rows="4"
				placeholder="Please describe your relevant experience..."
			></textarea>
		</div>

		<div class="form-group">
			<label for="motivation">Motivation</label>
			<textarea 
				id="motivation"
				bind:value={formData.motivation}
				rows="4"
				placeholder="Why are you interested in this opportunity?"
			></textarea>
		</div>

		<div class="form-actions">
			<Button onClick={handleSubmit}>
				Submit Application
			</Button>
			
			<Button onClick={handleReset}>
				Reset Form
			</Button>
		</div>
	</form>
</div>

<style>
	.screening-form {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
		background: #f9f9f9;
		border-radius: 8px;
	}

	h2 {
		color: #333;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #555;
	}

	input, textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input:focus, textarea:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	:global(.form-actions .button) {
		padding: 0.75rem 1.5rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: background-color 0.2s;
	}

	:global(.form-actions .button:hover) {
		background: #0056b3;
	}

	:global(.form-actions .button:last-child) {
		background: #6c757d;
	}

	:global(.form-actions .button:last-child:hover) {
		background: #545b62;
	}
</style>
