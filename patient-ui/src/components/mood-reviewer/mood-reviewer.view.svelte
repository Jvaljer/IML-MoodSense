<script>
  import { ViewContainer } from '@marcellejs/design-system';
  export let mood;
  export let ChangeMood;
</script>

<ViewContainer>
  <div id="txt">Correct the prediction if needed: </div>
  <div id="container">
    <button id="happy-btn" on:click={() => ChangeMood('happy')}>Happy</button>
    <button id="sad-btn" on:click={() => ChangeMood('sad')}>Sad</button>
    <button id="angry-btn" on:click={() => ChangeMood('angry')}>Angry</button>
  </div>
  <div id="mood">Instance now have label: {mood}</div>
</ViewContainer>
