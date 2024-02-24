import '@marcellejs/core/dist/marcelle.css';
import * as m from '@marcellejs/core';

//----------------------------//
//          Components        //
//----------------------------//
const input = m.sketchPad();
input.title = 'Draw Your Instance';

const label = m.select(['angry','sad','happy'], 'happy');
//label.$value.subscribe((x) => console.log('label $value:', x));
label.title = 'Define its Label';

const launch = m.button('Launch');
launch.title = 'Cross-Validation Train';

const test_btn = m.button('Launch');
test_btn.title = 'Test the Loaded Model';

const capture = m.button('Save Instance');
capture.title = 'Save it to TRAINING';
const capture_test = m.button('Save Instance');
capture_test.title = 'Save it to TEST';


//----------------------------//
//       Dataset Handling     //
//----------------------------//
const store = m.dataStore('localStorage');
const extractor = m.mobileNet();

const trainset = m.dataset('TrainSet', store);
const train_plot = m.datasetScatter(trainset);
const train_table = m.datasetTable(trainset);

const testset = m.dataset('TestSet', store);
const test_plot = m.datasetScatter(testset);
const test_table = m.datasetTable(testset);

const dashboard = m.dashboard({
  title: 'MoodTracker - MLE',
  author: 'Jvaljer'
});

//----------------------------//
//       Cross-Validation     //
//----------------------------//
const classifier = m.mlpClassifier({ layers: [128, 64, 32], epochs: 15, batchSize: 16}).sync(
	store,
	"mlp-dash"
);
const params = m.modelParameters(classifier);

const progress = m.trainingProgress(classifier);
const cv_plot = m.trainingPlot(classifier);
const history = m.trainingHistory(store, 
	{ metrics: ['accuracy'], actions: ['select model']}
).track(classifier, 'cv-mlp'); //might need to modify that in order to have [fold1, fold2, fold3] in one array

const cv_batch = m.batchPrediction("CV-batch", store);
const conf_mat = m.confusionMatrix(cv_batch);

function shuffleArray(a) {
	const b = a.slice();
	const rng = Math.random();
  
	for (let i = b.length - 1; i > 0; i--) {
	  	const j = Math.floor(rng * i);
	  	const temp = b[i];
	  	b[i] = b[j];
	  	b[j] = temp;
	}
  
	return b;
}
function waitForSuccess() {
	return new Promise((resolve, reject) => {
		classifier.$training.subscribe(({ status }) => {
			if (status === "success") {
		  		resolve();
			}
			if (status === "error") {
		  		reject();
			}
		});
	});
}

const folds = 3;
async function CrossVal(model, dataset){
	const instances = await dataset
		.items()
		.query({ $sort: {createdAt: -1} })
		.select(['id','x','y'])
		.toArray()
		.then(shuffleArray);
	
	const n = instances.length;
	const fsize = Math.floor(n/folds);
	//in our case, it would be more relevant to equalize the amount of instances per label in each folds
		//(because relatively small dataset & kinda complex datas)
	const batched = Array.from(Array(folds), (_, i) => {
		return instances.slice(i*fsize, Math.min((i+1)*fsize, instances.length));
	});

	await cv_batch.clear();
	for await (const i of Array.from(Array(folds), (_, j) => j)) {
		const train_data = batched.filter((_, z) => i !== z).flat();
		const test_data = batched.filter((_, z) => i === z).flat();
		console.log('train_data.length=', train_data.length, 'test_data.length=', test_data.length);

		await classifier.train(m.iterableFromArray(train_data));
		await waitForSuccess();
		await batch.predict(classifier,m.iterableFromArray(test_data));
	}
}

//----------------------------//
//      Testing Selection     //
//----------------------------//
const load_test = m.button('Load');
load_test.title = 'Load The Selected Model';

//----------------------------//
//    Other Events Handling   //
//----------------------------//
const $train_instance = capture.$click
	.sample(input.$images)
	.map(async(img) => ({
		x: await extractor.process(img),
		y: label.$value.get(),
		thumbnail: input.$thumbnails.get(),
	}))
	.awaitPromises()
	.subscribe(trainset.create);

const $test_instance = capture_test.$click
	.sample(input.$images)
	.map(async(img) => ({
		x: await extractor.process(img),
		y: label.$value.get(),
		thumbnail: input.$thumbnails.get(),
	}))
	.awaitPromises()
	.subscribe(testset.create);

launch.$click.subscribe(() => {
	CrossVal(classifier, trainset);
});

var model_run;
history.$selection.subscribe((run) => {
	if(run[0]!=undefined){
		model_run = run[0]; //only the first of the selected runs
		console.log("run is named: "+run[0]["name"]);
		console.log("run has parameters: "+run[0]["params"]);
	}
});

test_btn.$click.subscribe(async() => {
	if(model_run!=null){
		console.log("we wanna test the model: "+model_run["name"]);
	} else {
		console.log("there's no selected model to test");
	}
});

//----------------------------//
//   Dashboard Organisation   //
//----------------------------//
dashboard.page('Cross-Validation',false)
  .use([params, launch])
  .use(progress)
  .use(cv_plot, conf_mat);


dashboard.page('Testing', false)
	.use(history)
	.use([load_test, test_btn]);


dashboard.page('Dataset', false)
  .use(input)
  .use([label, capture, capture_test])
  .use([train_table, test_table])
  .use([train_plot, test_plot]);

//@ or create another page for a more developped training history
//dashboard.page('Training History');
dashboard.settings
  .dataStores(store)
  .datasets(trainset)
  .models(classifier)
  .predictions(cv_batch);

dashboard.show();