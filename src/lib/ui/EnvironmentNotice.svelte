<script lang="ts">
	import IconMdiAlertCircleOutline from '@iconify-svelte/mdi/alert-circle-outline';
	import { _ } from '$lib/i18n';
	import { IS_NON_PRODUCTION } from '$lib/const';
</script>

{#if IS_NON_PRODUCTION}
	<div class="my-2 w-full px-2 xl:px-4">
		<div class="alert items-start alert-warning" role="alert" aria-live="polite">
			<IconMdiAlertCircleOutline class="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
			<div>
				<p class="font-semibold">
					{$_('environment_notice.title', { default: 'Non-production environment' })}
				</p>
				<p>
					{$_('environment_notice.message', {
						default: 'Data and features on this site may change or be reset without notice.'
					})}
				</p>
			</div>
		</div>
	</div>
{/if}
