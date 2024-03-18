<script>
import { ViewContainer } from '@marcellejs/design-system';
export let title;
export let count;
export let fold_done;
export let mean_acc;
export let accs;
</script>

<style>
  .container{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 100px;
  }
  .cur-box{
    align-self: center;
    justify-self: center;
    font-size: 35px;
  }

  .fold{
    border: 5px solid rgb(72, 72, 72);
    border-radius: 24px;
    font-size: 24px;
    font-weight: italic;
    color: rgb(72, 72, 72);
    padding: 0.5% 1% 0% 1%;
  }
  .value{
    font-size: 20px;
    font-weight: bold;
    color: black;
  }

  .mean{
    font-size:64px;
    color: rgb(96, 151, 255);
    border-radius: 24px;
  }
  .result-good{
    color: green;
    font-weight: bold;
  }
  .result-avgood{
    color: lightgreen;
    font-weight: bold;
  }
  .result-avbad{
    color: orange;
    font-weight: bold;
  }
  .result-bad{
    color: red;
    font-weight: bold;
  }
</style>

<ViewContainer {title}>
  <div class="container" align="center">
    <div class="cur-box" align="center"><b>{count}/3</b></div>
    <div class="fold">1st: 
      <div class="value">
        {#if !fold_done(0)}
          <p>Not Done</p>
        {:else}
          <p>{accs[0]}</p>
        {/if}
      </div>
    </div>

    <div class="fold">2nd: 
      <div class="value">
        {#if !fold_done(1)}
          <p>Not Done</p>
        {:else}
          <p>{accs[1]}</p>
        {/if}
      </div>
    </div>

    <div class="fold">3rd: 
      <div class="value">
        {#if !fold_done(2)}
          <p>Not Done</p>
        {:else}
          <p>{accs[2]}</p>
        {/if}
      </div>
    </div>

    <div class="mean">
        <div class="result">
          {#if !fold_done(2)}
            <br>Waiting...
          {:else}
            {#if mean_acc()<0.25}
              <div class="result-bad">
                {mean_acc()}
              </div>
            {:else if mean_acc()<0.5}
              <div class="result-avbad">
                {mean_acc()}
              </div>
            {:else if mean_acc()<0.75}
              <div class="result-avgood">
                {mean_acc()}
              </div>
            {:else}
              <div class="result-good">
                {mean_acc()}
              </div>
            {/if}
          {/if}
        </div>
      </div>
  </div>
</ViewContainer>