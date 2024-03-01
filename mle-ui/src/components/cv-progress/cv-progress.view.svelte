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

  .left{
    font-size: 20px;
  }
  .center{
    font-size: 20px;
  }
  .right{
    font-size: 20px;
  }
  .mean{
    margin-left:30px;
    font-size: 20px;
  }
</style>

<ViewContainer {title}>
  <div class="container" align="center">
    <div class="cur-box" align="center"><b>{count}/3</b></div>
    <div class="left">Iteration #1: <p>{#if !fold_done(0)}<i>Not Done</i>{:else}<p>Accuracy: <b>{accs[0]}</b></p>{/if}</p></div>
    <div class="center">Iteration #2: <p>{#if !fold_done(1)}<i>Not Done</i>{:else}<p>Accuracy: <b>{accs[1]}</b></p>{/if}</p></div>
    <div class="right">Iteration #3: <p>{#if !fold_done(2)}<i>Not Done</i>{:else}<p>Accuracy: <b>{accs[2]}</b></p>{/if}</p></div>
    <div class="mean">Mean Accuracy: <p>{#if !fold_done(2)}<i>Waiting...</i>{:else} <b>{mean_acc()}</b> {/if}</p></div>
  </div>
</ViewContainer>