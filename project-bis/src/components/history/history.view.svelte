<script>
  import { ViewContainer } from '@marcellejs/design-system';
  export let title;
  export let list;
  export let Click;
  export let selected;
</script>

<style>
  .box{
    font-size: 20px;
  }

  .button-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .button-container button {
    margin-bottom: 15px;
    padding: 8px 16px;
    font-size: 20px;
  }
</style>

<ViewContainer {title}>
  <div>
    <div class="box">
      {#if selected == undefined}
        No Model Selected ...
      {:else}
        You Selected the Model <b>"{selected}"</b>
      {/if}
    </div>
    <div class="button-container">
      {#each list as item}
        <button on:click={() => Click(item)}>{item}</button>
      {/each}
    </div>
  </div>
</ViewContainer>
