import '@marcellejs/core/dist/marcelle.css';
import * as m from '@marcellejs/core';
import { loadedIndicator } from './components';

//----------------------------//
//          Components        //
//----------------------------//
const input = m.imageUpload({ width: 224, height: 224 });
//const input = m.sketchPad(); //only for quick local testing
const instanceViewer = m.imageDisplay(input.$images);
input.title = 'Upload Your Image';


const label = m.select(['angry','sad','happy'], 'happy');
//const label = m.select(['square','triangle'], 'square'); //for testing purposes only
label.title = 'Define its Label';

const launch = m.button('Launch');
launch.title = 'Cross-Validation Train';

const test_btn = m.button('Launch');
test_btn.title = 'Test Loaded Model';
const toggle = m.toggle('Toggle Testing from Upload Image');
toggle.title = 'Testing on Dataset';

const test_input = m.imageUpload({ width: 224, height: 224 });
//const test_input = m.sketchPad(); //only for local testing purposes
test_input.title = 'Upload an image you wanna test';
const test_viewer = m.imageDisplay(test_input.$images);
test_viewer.title = 'Preview of your Image';

const capture = m.button('Save Instance');
capture.title = 'Save it to TRAINING';
const capture_test = m.button('Save Instance');
capture_test.title = 'Save it to TEST';


//----------------------------//
//       Dataset Handling     //
//----------------------------//
const store = m.dataStore(
    'https://marcelle.lisn.upsaclay.fr/iml2024/api'
  );
try {
    await store.connect();
} catch (error) {
    await store.loginWithUI();
}
//const store = m.dataStore('localStorage'); //only for local testing purposes
const extractor = m.mobileNet();

const trainset = m.dataset('project-images', store);

const train_plot = m.datasetScatter(trainset);
const train_table = m.datasetTable(trainset);
train_table.title = 'Training Set';

const testset = m.dataset('TestSet', store);
const test_plot = m.datasetScatter(testset);
const test_table = m.datasetTable(testset);
test_table.title = ' Testing Set';

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
    { metrics: ['accuracy'], actions: ['select model'], multiple: false}
).track(classifier, 'training'); //might need to modify that in order to have [fold1, fold2, fold3] in one array

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

        await classifier.train(m.iterableFromArray(train_data));
        await waitForSuccess();
        await cv_batch.predict(classifier,m.iterableFromArray(test_data));
    }
}

//----------------------------//
//      Testing Selection     //
//----------------------------//
const load_test = m.button('Load');
load_test.title = 'Load Selected Model';

const load_clf = m.mlpClassifier({ layers: [64,32], epochs:10});

const indicator = loadedIndicator();
/*//this part works, but isn't linked to the selected model at all
const $features = test_input.$images
    .filter(() => toggle.$checked.get() && classifier.ready)
    .map((img) => extractor.process(img)) //might gonna change that to the loaded model...
    .awaitPromises();

const $predictions = $features
    .map((features) => classifier.predict(features))
    .awaitPromises();

const test_pred = m.confidencePlot($predictions);
*/
const $features = test_input.$images
    .filter(() => toggle.$checked.get() && indicator.loaded_run!=undefined)
    .map((img) => extractor.process(img))
    .awaitPromises();
const $predictions = $features
    .map(async(f) => {
        load_clf.load(indicator.loaded_run);
        load_clf.predict(f);
    }) //this ain't a function tho
    .awaitPromises();
const test_pred = m.confidencePlot($predictions);

const test_batch = m.batchPrediction("test-batch", store);
const test_mat = m.confusionMatrix(test_batch);

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
    //will need to adapt this to the new history 
    if(run[0]!=undefined){
        model_run = run[0]; //only the first of the selected runs
    }
});

load_test.$click.subscribe(() => {
    indicator.load(model_run);
});

test_btn.$click.subscribe(async() => {
    if(indicator.loaded_run!=null && !toggle.$checked.get()){
        const run = indicator.loaded_run["checkpoints"];

		await test_batch.clear();
		classifier.load(run[0]);
		await test_batch.predict(classifier, testset);

        /*
        Object.keys(classifier).forEach(key => {
            console.log(`${key}: ${classifier[key]}`);
        });*/
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
    .use([load_test, test_btn, indicator, toggle])
    .use([test_input, test_viewer, test_pred])
    .use(test_mat);


dashboard.page('Dataset')
  .sidebar(input, instanceViewer, label)
  .use([capture, capture_test])
  .use([train_table, test_table])
  .use([train_plot, test_plot]);

//@ or create another page for a more developped training history
//dashboard.page('Training History');
dashboard.settings
  .dataStores(store)
  .datasets(trainset, testset)
  .models(classifier)
  .predictions(cv_batch, test_batch);

dashboard.show();