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

const capture = m.button('Save Instance');
capture.title = 'Save it to TRAINING';
const capture_test = m.button('Save Instance');
capture_test.title = 'Save it to TEST';

/*const folds_cnt = m.number(3);
folds_cnt.title = 'Folds Amount';*/

//----------------------------//
//       Dataset Handling     //
//----------------------------//
const store = m.dataStore('localStorage');
const trainset = m.dataset('TrainSet', store);
const train_plot = m.datasetScatter(trainset);
const train_table = m.datasetTable(trainset);

const extractor = m.mobileNet();

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
).track(classifier, 'cv-mlp');

const batch = m.batchPrediction("CV-batch", store);
const conf_mat = m.confusionMatrix(batch);

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

	await batch.clear();
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
//       Events Handling      //
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

launch.$click.subscribe(() => {
	CrossVal(classifier, trainset);
});

//----------------------------//
//   Dashboard Organisation   //
//----------------------------//
dashboard.page('Cross-Validation',false)
  .use([params, launch])
  .use(progress)
  .use(cv_plot, conf_mat);


dashboard.page('Model Testing')
	.use(history);

dashboard.page('Dataset', false)
  .use(input)
  .use([label, capture])
  .use(train_table)
  .use(train_plot);

//@ or create another page for a more developped training history
//dashboard.page('Training History');
dashboard.settings
  .dataStores(store)
  .datasets(trainset)
  .models(classifier)
  .predictions(batch);

dashboard.show();