<script lang="ts">
	import Card from '$lib/ui/Card.svelte';
	import { API_HOST, IMAGE_HOST } from '$lib/const';
	import type { Product } from '$lib/api';

	interface Props {
		barcode: string;
		currentUser: { user_id: string; password: string };
		productData: Product;
	}

	const { barcode, currentUser, productData }: Props = $props();

	let selectedImage = $state<File | null>(null);
	let isUploading = $state(false);
	let imageType = $state<'front' | 'ingredients'>('front');

	async function uploadImage() {
		if (!selectedImage) {
			alert('Please select an image to upload.');
			return;
		}

		isUploading = true;
		const formData = new FormData();
		formData.append('code', barcode);
		formData.append('imagefield', imageType);
		formData.append(`imgupload_${imageType}`, selectedImage);

		try {
			const response = await fetch(`${API_HOST}/cgi/product_image_upload.pl`, {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: `Basic ${btoa(`${currentUser.user_id}:${currentUser.password}`)}`
				}
			});

			if (response.ok) {
				const result = await response.json();
				const imageUrl = IMAGE_HOST + result.files[0].thumbnailUrl;
				if (imageType === 'front') {
					productData.image_front_url = imageUrl;
				} else if (imageType === 'ingredients') {
					productData.image_ingredients_url = imageUrl;
				}
				alert('Image uploaded successfully!');
			} else {
				alert('Failed to upload image. Please try again.');
			}
		} catch (error) {
			console.error('Error uploading image:', error);
		} finally {
			isUploading = false;
		}
	}

	async function handleFileChange(event: Event, type: 'front' | 'ingredients') {
		const target = event.target as HTMLInputElement | null;
		if (target && target.files) {
			selectedImage = target.files[0];
			imageType = type;
			await uploadImage();
		}
	}
</script>

<Card>
	<h3 class="mb-4 text-3xl font-semibold">Upload Product Image</h3>
	<div class="form-control mb-4">
		<label for="product_image">Front Image</label>
		<input
			id="product_image"
			type="file"
			accept="image/*"
			class="input input-bordered w-full"
			onchange={async (e) => handleFileChange(e, 'front')}
		/>
	</div>
	{#if isUploading && imageType === 'front'}
		<p class="text-center text-gray-500">Uploading image, please wait...</p>
	{/if}

	<div class="form-control mb-4">
		<label for="ingredients_image">Ingredients Image</label>
		<input
			id="ingredients_image"
			type="file"
			accept="image/*"
			class="input input-bordered w-full"
			onchange={async (e) => handleFileChange(e, 'ingredients')}
		/>
	</div>
	{#if isUploading && imageType === 'ingredients'}
		<p class="text-center text-gray-500">Uploading image, please wait...</p>
	{/if}
</Card>
