<script lang="ts">
	import { _ } from '$lib/i18n';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const redirectTarget = $derived(page.url.searchParams.get('redirect') || '/');
</script>

<div class="flex min-h-[50vh] w-full flex-col items-center justify-center px-4 py-16 sm:py-24">
	<div class="card w-full max-w-lg bg-base-100">
		<div class="card-body items-center p-8 text-center">
			<div class="mb-6 flex justify-center">
				<img src="/login.svg" alt="Login required" class="h-24 w-24" />
			</div>
			<h1 class="text-3xl font-bold">
				{$_('product.edit.login_required_title', { default: 'Login Required' })}
			</h1>
			<p class="py-4 text-lg text-base-content/80">
				{$_('product.edit.login_required_body', {
					default:
						'You must be logged in to contribute to the database. Sign in to add or edit food product information.'
				})}
			</p>
			<div class="mt-4 card-actions flex w-full flex-col gap-3">
				<a
					rel="external"
					href="{resolve('/oauth/login')}?redirect={encodeURIComponent(redirectTarget)}"
					class="btn w-full font-bold text-primary-content shadow-md btn-lg btn-primary"
				>
					{$_('navbar.login', { default: 'Login' })}
				</a>
				<a href={resolve('/')} class="btn btn-ghost btn-sm">
					{$_('product.edit.return_to_home', { default: 'Return to Home' })}
				</a>
			</div>
		</div>
	</div>
</div>
