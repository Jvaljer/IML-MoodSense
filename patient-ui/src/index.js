import '@marcellejs/core/dist/marcelle.css';
import * as m from '@marcellejs/core';
import { moodReviewer } from './components';

//-------------------------------------------//
//          Marcelle Base Components         //
//-------------------------------------------//
const input = m.webcam();
const pad = m.text('<div class="pad"></div>');

const capture = m.button('Capture your mood');
const txt = m.text('<div class="mtext">Below you can observe and Correct the predicted mood !</div>');


const shadow_src = m.imageUpload({ width:224, height:224 });
const display0 = m.imageDisplay(shadow_src.$images);

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

const $feature = shadow_src.$images
	.map((img) => extractor.process(img))
	.awaitPromises();
const $prediction = $feature
	.map((feat) => clf.predict(feat))
	.awaitPromises();

const plot = m.confidencePlot($prediction);

//-----------------------------------//
//          Streams Handling         //
//-----------------------------------//
capture.$click.subscribe(async() => {
	if(input.$images.get()!=undefined){
		//now we wanna move on with that one (tolerating multiple selection but not working with it tho)
		mood = input.$images.get();
		var thumb = input.$thumbnails.get();
		shadow_src.$images.set(mood);

		mood_inst = {
			x: await extractor.process(mood),
        	y: 'undefined',
        	thumbnail: thumb,
		}

		//now I wanna add the captured picture to the HTML UI
		document.querySelector(".no").style.display = "none";
		document.querySelector(".yes").style.display = "block";
	}
});

//-------------------------------------//
//          Wizard Organisation        //
//-------------------------------------//
const wiz = m.wizard();
wiz
	.page()
	.title('Record & Review your Mood')
	.description('Take a picture of your mood:')
	.use(input, capture, pad, display0, txt, plot, reviewer);

//------------------------------------//
//         HTML Doc Handling          //
//------------------------------------//
document.querySelector('#open-wizard').addEventListener('click', () => {
	//here we are gonna handle the setup of classifier and store fetching infos
	wiz.show();
	clf.load(store, 'base-clf');
});

document.querySelector('#open-week-tab').addEventListener('click', () => {
	console.log("open the WEEK tab there");
});

document.querySelector('#open-month-tab').addEventListener('click', () => {
	console.log("open the MONTH tab there");
});