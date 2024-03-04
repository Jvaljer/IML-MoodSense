import '@marcellejs/core/dist/marcelle.css';
import * as m from '@marcellejs/core';

//-------------------------------------------//
//          Marcelle Base Components         //
//-------------------------------------------//
const input = m.webcam();
input.title = 'Preview the picture you are gonna take';

const capture = m.button('Click to Record');

const display = m.imageDisplay(input.$images);

const txt0 = m.text('If you are satisfied with the captured picture, go onto the next page !');

//-----------------------------------//
//          Intern Variables         //
//-----------------------------------//
var tmp_img;
var image;

//------------------------------------------//
//          Data Storage & Handling         //
//------------------------------------------//
const store = m.dataStore('localStorage');
const extractor = m.mobileNet();

const trainset = m.dataset('project-images', store);
const pic_set = m.dataset('mood-set', store);

//-------------------------------------------//
//          Classifier & Predictions         //
//-------------------------------------------//
const clf = m.mlpClassifier({ 
    layers: [128, 64, 64, 32], 
    epochs: 15, 
    batchSize: 32
});
clf.load(store, 'base-clf');

const batch = m.batchPrediction("patient-batch", store);

//-----------------------------------//
//          Streams Handling         //
//-----------------------------------//
const $instance = capture.$click
	.sample(input.$images)
	.map(async(img) => ({
		x: await extractor.process(img),
        y: 'mood',
        thumbnail: input.$thumbnails.get(),
	}))
	.awaitPromises()
	.subscribe(pic_set.create);

//-------------------------------------//
//          Wizard Organisation        //
//-------------------------------------//
const wiz = m.wizard();
wiz
	.page()
	.title('First')
	.description('Take a picture of your mood:')
	.use(input, capture, display, txt0)
	.page()
	.title('Second')
	.description('Now understand the navigation');
;

//------------------------------------//
//         HTML Doc Handling          //
//------------------------------------//
document.querySelector('#open-wizard').addEventListener('click', () => {
	wiz.show();
});

document.querySelector('#open-week-tab').addEventListener('click', () => {
	console.log("open the WEEK tab there");
});

document.querySelector('#open-month-tab').addEventListener('click', () => {
	console.log("open the MONTH tab there");
});