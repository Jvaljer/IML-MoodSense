import '@marcellejs/core/dist/marcelle.css';
import * as m from '@marcellejs/core';

//-------------------------------------------//
//          Marcelle Base Components         //
//-------------------------------------------//
const input = m.webcam();
input.title = 'Preview the picture you are gonna take';

const capture = m.button('Click to Record');
const txt0 = m.text('\n\n <h2>If you are satisfied with the captured picture, go onto the next page !</h2>');

const shadow_src = m.imageUpload({ width:224, height:224 });
const display = m.imageDisplay(shadow_src.$images);

//-----------------------------------//
//          Intern Variables         //
//-----------------------------------//
const recorded = [];

//------------------------------------------//
//          Data Storage & Handling         //
//------------------------------------------//
const store = m.dataStore('localStorage');
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

capture.$click.subscribe(() => {
	if(input.$images.get()!=undefined){
		console.log("setting the recorded mood as: "+input.$images.get());
		//now we wanna move on with that one (tolerating multiple selection but not working with it tho)
		shadow_src.$images.set(input.$images.get());
	}
});
//-------------------------------------//
//          Wizard Organisation        //
//-------------------------------------//
const wiz = m.wizard();
wiz
	.page()
	.title('Recording')
	.description('Take a picture of your mood:')
	.use(input, capture, browser, display, txt0)
	.page()
	.title('Reviewing')
	.description('Review and Correct your mood:')
	.use();
;

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