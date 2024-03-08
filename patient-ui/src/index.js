import '@marcellejs/core/dist/marcelle.css';
import * as m from '@marcellejs/core';
import { moodReviewer } from './components';

//-------------------------------------------//
//          Marcelle Base Components         //
//-------------------------------------------//
const input = m.webcam();

const capture = m.button('Capture your mood');
const txt0 = m.text('<br>If you are satisfied with the captured picture, go onto the next page !');
const txt1 = m.text('<br>You captured the mood:');

const shadow_src = m.imageUpload({ width:224, height:224 });
const display0 = m.imageDisplay(shadow_src.$images);

const src = m.imageUpload({ width:224, height:224 });
const display1 = m.imageDisplay(src.$images);

const txt2 = m.text("Click to Load the Captured Mood<br>And Launch the model's prediction");
const load = m.button('Load');

const reviewer = moodReviewer();

//--------------------------------------------//
//          Intern Variables & Methods        //
//--------------------------------------------//
var mood;
var mood_inst;

//------------------------------------------//
//          Data Storage & Handling         //
//------------------------------------------//
const store = m.dataStore(
	'https://marcelle.lisn.upsaclay.fr/iml2024/api'
  );
try {
	await store.connect();
} catch (error) {
	await store.loginWithUI();
}
const extractor = m.mobileNet();

const trainset = m.dataset('project-images', store);
const tmp_set = m.dataset('temporary', store);

const browser = m.datasetBrowser(tmp_set);
browser.title = 'Recorded Moods'

//-------------------------------------------//
//          Classifier & Predictions         //
//-------------------------------------------//
const clf = m.mlpClassifier({ 
    layers: [128, 64, 64, 32], 
    epochs: 15, 
    batchSize: 32
});

const batch = m.batchPrediction("patient-batch", store);

//-----------------------------------//
//          Streams Handling         //
//-----------------------------------//
/*const $instance = capture.$click
	.sample(input.$images)
	.map(async(img) => ({
		x: await extractor.process(img),
        y: 'tmp',
        thumbnail: input.$thumbnails.get(),
	}))
	.awaitPromises()
	.subscribe(tmp_set.create); */

capture.$click.subscribe(async() => {
	if(input.$images.get()!=undefined){
		console.log("setting the recorded mood as: "+input.$images.get());
		//now we wanna move on with that one (tolerating multiple selection but not working with it tho)
		mood = input.$images.get();
		var thumb = input.$thumbnails.get();
		shadow_src.$images.set(mood);

		mood_inst = {
			x: await extractor.process(mood),
        	y: 'undefined',
        	thumbnail: thumb,
		}
	}
});

load.$click.subscribe(() => {
	src.$images.set(mood);
	reviewer.SetInstance(mood_inst);
});

//-------------------------------------//
//          Wizard Organisation        //
//-------------------------------------//
const wiz = m.wizard();
wiz
	.page()
	.title('Recording')
	.description('Take a picture of your mood:')
	.use(input, capture, txt1, display0, txt0)
	.page()
	.title('Reviewing')
	.description('Review and Correct your mood:')
	.use([txt2, load], display1, reviewer);

//------------------------------------//
//         HTML Doc Handling          //
//------------------------------------//
document.querySelector('#open-wizard').addEventListener('click', () => {
	//here we are gonna handle the setup of classifier and store fetching infos
	wiz.show();
	//clf.load(store, 'base-clf');
});

document.querySelector('#open-week-tab').addEventListener('click', () => {
	console.log("open the WEEK tab there");
});

document.querySelector('#open-month-tab').addEventListener('click', () => {
	console.log("open the MONTH tab there");
});