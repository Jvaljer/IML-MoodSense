import '@marcellejs/core/dist/marcelle.css';
import * as m from '@marcellejs/core';

/*----------------------------*
 *  Components Instantiation  *
 -----------------------------*/
const input = m.sketchPad();
const label_txt = m.textInput();
label_txt.title = 'Instance Label (using text)';
const label_sel = m.select(['angry','sad','happy'], 'happy');
//label.$value.subscribe((x) => console.log('label $value:', x));
label_sel.title = 'Instance Label (using selector)';

const start_train = m.button('Launch');
start_train.title = 'Training';

const dashboard = m.dashboard({
  title: 'MoodTracker - MLE',
  author: 'Jvaljer'
});

/*----------------------------*
 *      Cross-Validation      *
 -----------------------------*/
const folds_cnt = m.numberInput(3);
folds_cnt.title = 'Folds Amount';

folds_cnt.$value.suscribe(value => {
  //on value change do ...
});

/*----------------------------*
 *      Events Handling       *
 -----------------------------*/
start_train.$click.suscribe(async () => {
  const folds_cnt = folds_cnt.$value();
  const curves = await CrossValidation(folds_cnt);

  DisplayCurves(curves);

  const avg_acc = AverageAccuracy(curves);
  console.log('Average Accuracy is: ', avg_acc);
});

/*----------------------------*
 *   Dashboard Organisation   *
 -----------------------------*/
//this page shall contain both training and testing UIs
  //maybe include the training history in this ? **
dashboard.page('Train & Test',false)
  .use(folds_cnt)
  .use(start_train);

//this other page shalle include the whole dataset and management tools
dashboard.page('Dataset', false)
  .use(input,[label_sel, label_txt]); //this vows to be removed later on

//** or create another page for a more developped training history
//dashboard.page('Training History');

dashboard.show();

/*----------------------------*
 *     Internal Functions     *
 -----------------------------*/
 async function CrossValidation(f_cnt){
  const acc_curves = [];

  for(let fold = 0; fold<f_cnt; fold++){
    const acc_crv = await TrainEvalFold(fold);
    acc_curves.push(acc_crv);
  }

  return acc_curves;
 }

 async function TrainEvalFold(fold){
  //must implement
 }

function DisplayCurves(curves){
  //must implement
 }

function AverageAccuracy(curves){
  //must implement
}
