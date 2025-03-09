<script lang="ts">
    export let product;
</script>

<a href="/products/{product.code}" class="flex h-24 flex-row items-center rounded-lg dark:bg-base-300 bg-white p-2">
    {#if product.image_front_small_url}
        <img src={product.image_front_small_url} class="mr-4 h-20 w-16" alt="Product front" />
    {/if}
    <div class="link no-underline">
        {product.product_name ?? product.code}
    </div>
</a>