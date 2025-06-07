<!-- <script>
  import { onMount, onDestroy } from 'svelte';

  let iframeHeight = 'auto'; // Initial height, or a default value
  let iframeSrc = 'http://localhost:5173/'; // Replace with your actual URL

  function handleMessage(event) {
    // IMPORTANT: Verify the origin of the message for security!
    // Replace 'https://your-embedded-site.com' with the actual origin of the embedded site

    console.log('Message received:', event.source.innerHeight);
    console.log('Message received:', json(event.source.innerHeight));

    if (event.data && event.data.type === 'iframeHeight' && typeof event.data.height === 'number') {
      iframeHeight = `${event.data.height}px`;
      console.log('Received iframe height:', iframeHeight);
    }
  }

  onMount(() => {
    window.addEventListener('message', handleMessage);
  });

  onDestroy(() => {
    window.removeEventListener('message', handleMessage);
  });
</script>

<main>
  <h2>Content from another website:</h2>
  <iframe
    src={iframeSrc}
    title="Embedded Content"
    style="width: 100%; height: 713px; border: none; overflow: hidden;"
    scrolling="no" >
    <p>Your browser does not support iframes.</p>
  </iframe>
</main>


<style>
  main {
    padding: 20px;
  }
</style> -->

<iframe
  src="https://world.openfoodfacts.org/discover?content_only=1"
  class="w-full border-0"
  style="height: 600vh; min-height: 100vh;"
  title="Discover Open Food Facts"
  scrolling="auto"
  frameborder="0"
></iframe>