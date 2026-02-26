<script lang="ts">
	type Props = {
		src?: string;
		alt?: string;
		zoom?: number;
		translation?: { x: number; y: number };
		rotation?: number;
		minzoom?: number;
		maxzoom?: number;
	};
	let {
		src,
		alt,
		zoom = $bindable(1),
		rotation = $bindable(0),
		translation = $bindable({ x: 0, y: 0 }),
		minzoom = 1,
		maxzoom = 3
	}: Props = $props();

	let containerEl: HTMLElement | undefined;

	let isDragging = $state(false);
	let prev = $state({ x: 0, y: 0 });

	$effect(() => {
		const wheelListener = (e: WheelEvent) => {
			e.preventDefault();
			if (e.deltaY < 0) {
				zoom = Math.min(zoom + 0.1, maxzoom);
			} else {
				zoom = Math.max(zoom - 0.1, minzoom);
			}
		};

		const mouseDownListener = (e: MouseEvent) => {
			isDragging = true;
			prev = { x: e.clientX, y: e.clientY };
		};

		const touchStartListener = (e: TouchEvent) => {
			if (e.touches.length === 1) {
				isDragging = true;
				prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			}
		};

		const mouseMoveListener = (e: MouseEvent) => {
			if (isDragging) {
				const dx = e.clientX - prev.x;
				const dy = e.clientY - prev.y;
				translation = { x: translation.x + dx, y: translation.y + dy };
				prev = { x: e.clientX, y: e.clientY };
			}
		};

		const touchMoveListener = (e: TouchEvent) => {
			if (isDragging && e.touches.length === 1) {
				const touch = e.touches[0];
				const dx = touch.clientX - prev.x;
				const dy = touch.clientY - prev.y;
				translation = { x: translation.x + dx, y: translation.y + dy };
				prev = { x: touch.clientX, y: touch.clientY };
			}
		};

		const mouseUpListener = () => {
			isDragging = false;
		};

		const touchEndListener = () => {
			isDragging = false;
		};

		containerEl?.addEventListener('wheel', wheelListener);
		containerEl?.addEventListener('mousedown', mouseDownListener);
		containerEl?.addEventListener('touchstart', touchStartListener);
		containerEl?.addEventListener('mousemove', mouseMoveListener);
		containerEl?.addEventListener('touchmove', touchMoveListener);
		containerEl?.addEventListener('mouseup', mouseUpListener);
		containerEl?.addEventListener('touchend', touchEndListener);

		return () => {
			containerEl?.removeEventListener('wheel', wheelListener);
			containerEl?.removeEventListener('touchstart', touchStartListener);
			containerEl?.removeEventListener('mousedown', mouseDownListener);
			containerEl?.removeEventListener('mousemove', mouseMoveListener);
			containerEl?.removeEventListener('touchmove', touchMoveListener);
			containerEl?.removeEventListener('mouseup', mouseUpListener);
			containerEl?.removeEventListener('touchend', touchEndListener);
		};
	});

	let style = $derived(
		`transform: translate(${translation.x}px, ${translation.y}px) scale(${zoom}) rotate(${rotation}deg);`
	);
</script>

<div
	class="relative flex h-full w-full max-w-full items-center justify-center overflow-hidden select-none"
	class:cursor-grab={!isDragging}
	class:cursor-grabbing={isDragging}
	bind:this={containerEl}
>
	<img class="pointer-events-none block h-full w-full object-contain" {src} {alt} {style} />
</div>
