<script>
  import { ViewContainer } from '@marcellejs/design-system';
  export let mood;
  export let ChangeMood;
</script>

<style>
  /* TO DO */
  #txt{
    font-size: 32px;
    padding-bottom: 4%;
  }
  #buttons{
    display: flex;
    justify-content: space-around;
    padding-bottom: 4%;
  }

  input[type="radio"]{
    display:none;
  }
  input[type="radio"]:checked + label{
    background-color: black;
    color: white;

  }
  input[type="radio"]:checked + label:before{
    height: 16px;
    width: 16px;
    border: 6px solid white;
    background-color: black;
  }

  label{
    position: relative;
    color: rgba(0,0,0,1);
    font-size: 24px;
    font-weight: bold;
    border: 3px solid black;
    border-radius: 16px;
    padding: 4px 8px 4px 8px;
    display:flex;
    align-items: center;
    cursor: pointer;
  }
  label:before{
    content: "";
    height: 30px;
    width: 30px;
    border: 3px solid black;
    border-radius: 50%;
    margin-right: 8px;
  }
</style>

<ViewContainer>
  <div id="txt"><br>Correct the prediction if needed: <br></div>
  <div id="buttons">
    <input type="radio" name="mood" id="happy">
    <label for="happy">Happy</label>
    <input type="radio" name="mood" id="sad">
    <label for="sad">Sad</label>
    <input type="radio" name="mood" id="angry">
    <label for="angry">Angry</label>
  </div>
</ViewContainer>
