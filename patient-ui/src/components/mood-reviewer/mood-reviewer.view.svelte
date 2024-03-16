<script>
  import { ViewContainer } from '@marcellejs/design-system';
  export let mood;
  export let ChangeMood;
</script>

<style>
  /* TO DO */
  #txt{
    font-size: 32px;
    padding-bottom: 2%;
  }
  #buttons{
    display: flex;
    justify-content: space-around;
  }
  .custom-btn {
    font-size: 24px;
    padding: 2% 8% 2% 8%;
    border-radius: 24px;
    cursor:pointer ;
  }

  .custom-btn:active {
    background-color: rgb(143, 143, 143);
  }
</style>

<ViewContainer>
  <div id="txt"><br>Correct the prediction if needed: <br></div>
  <div id="buttons">
    <button class="custom-btn" id="happy-btn" on:click={() => ChangeMood('happy')}>Happy</button>
    <button class="custom-btn" id="sad-btn" on:click={() => ChangeMood('sad')}>Sad</button>
    <button class="custom-btn" id="angry-btn" on:click={() => ChangeMood('angry')}>Angry</button>
  </div>
</ViewContainer>
