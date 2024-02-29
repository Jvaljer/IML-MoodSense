<script>
  import { ViewContainer } from '@marcellejs/design-system';
  export let title;
  export let list;
  export let Click;
</script>

<style>
  /* Style for the buttons */
  .button-container {
    display: flex;
    flex-wrap: wrap; /* Enable wrapping */
    gap: 10px; /* Space between buttons */
  }

  /* Style for each button */
  .button-container button {
    margin-bottom: 10px; /* Add some bottom margin */
  }
</style>

<ViewContainer {title}>
  <div>Trained Classifier History</div>
  <div class="button-container">
    {#each list as item}
      <button on:click={() => Click(item)}>{item}</button>
    {/each}
  </div>
</ViewContainer>
