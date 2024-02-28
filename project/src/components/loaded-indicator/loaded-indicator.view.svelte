<script>
import { ViewContainer } from '@marcellejs/design-system';
export let title;
export let loaded_run;
</script>

<ViewContainer {title}>
  <div id="model-info" align="center">
    {#if loaded_run != undefined}
      Loaded Model: <i>{JSON.stringify(loaded_run["name"])}</i>
    {:else}
      Loaded Model: <i>None</i>
    {/if}
  </div>
</ViewContainer>
