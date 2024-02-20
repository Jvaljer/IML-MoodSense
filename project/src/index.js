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
launch.title = 'Training';

const btn = m.button('Button');
btn.title = 'For testing purposes';

const capture = m.button('Save Instance');
capture.title = 'Save it to TRAINING';
const capture_test = m.button('Save Instance');
capture_test.title = 'Save it to TEST';


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
const classifier = m.mlpClassifier({ layers: [128, 64, 32], epochs: 15, batchSize: 16});

const folds_cnt = m.number(3);
folds_cnt.title = 'Folds Amount';

//Here is the wanted logic (check if possible)
/*
Hit the launch button
	Starts the N-fold validation
		Divide the dataset into N partitions
		select one of them 
			N selected must be different ones
		train the model N times, each time using another partition
	Get the performance of each iteration
	Combine them to obtain the average performace of the model
*/
//Should be done ?

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
	.awaitPromises();
$train_instance.subscribe(trainset.create);

//elements of an 'Instance'
/*
export interface Instance {
  id?: ObjectId; // Object identifier in the database
  x: any; // Typically, input data
  y: any; // Typically, output data (for supervised learning)
  thumbnail?: string; // Thumbnail used for display in components such as datasetBrowser
  [key: string]: any;
}
*/
launch.$click.subscribe(() => {
	//first we extract all instances under their label
	const happy = trainset
		.items() //turn into iterable
		.query({ y:'happy' }) //fetch for happy labeled instances
		.select(['id']) //we only want to access the idea
		.toArray(); //make it an array
	const sad = trainset
		.items()
		.query({ y:'sad' })
		.select(['id'])
		.toArray();
	const angry = trainset
		.items()
		.query({ y:'angry' })
		.select(['id'])
		.toArray();
	
	//then we devide each one of them into 3 sets
	//MUST IMPLEMENT
});


//----------------------------//
//   Dashboard Organisation   //
//----------------------------//
//this page shall contain both training and testing UIs
  //maybe include the training history in this ? @
dashboard.page('Cross-Validation',false)
  .use([folds_cnt, launch]);

//this other page shalle include the whole dataset and management tools
dashboard.page('Dataset', false)
  .use(input)
  .use([label, capture])
  .use(train_table)
  .use(train_plot);

//@ or create another page for a more developped training history
//dashboard.page('Training History');

dashboard.show();