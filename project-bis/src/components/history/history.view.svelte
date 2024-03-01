<script>
  import { ViewContainer } from '@marcellejs/design-system';
  export let title;
  export let list;
  export let Click;
</script>

<style>
  .button-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .button-container button {
    margin-bottom: 10px;
    padding: 8px 16px;
    font-size: 16px;
  }
</style>

<ViewContainer {title}>
  <div class="button-container">
    {#each list as item}
      <button on:click={() => Click(item)}>{item}</button>
    {/each}
  </div>
</ViewContainer>
