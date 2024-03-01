import '@marcellejs/core/dist/marcelle.css';
import * as m from '@marcellejs/core';
import { history, indicator, cvProgress } from './components';

//----------------------------//
//          Components        //
//----------------------------//
const input = m.imageUpload({ width: 224, height: 224 });
//const input = m.sketchPad(); //only for quick local testing
const instanceViewer = m.imageDisplay(input.$images);
input.title = 'Upload Your Image';
instanceViewer.title = 'Here yo ucan visualise it better';

const label = m.select(['angry','sad','happy'], 'happy');
//const label = m.select(['square','triangle','circle'], 'square'); //for testing purposes only
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
/*const store = m.dataStore(
    'https://marcelle.lisn.upsaclay.fr/iml2024/api'
  );
try {
    await store.connect();
} catch (error) {
    await store.loginWithUI();
}*/
const store = m.dataStore('localStorage'); //only for local testing purposes
const extractor = m.mobileNet();

const trainset = m.dataset('project-images', store);

const train_plot = m.datasetScatter(trainset);
train_plot.title = 'Train Data ScatterPlot';
const train_table = m.datasetTable(trainset);
train_table.title = 'Training Set';

const testset = m.dataset('TestSet', store);
const test_plot = m.datasetScatter(testset);
test_plot.title = 'Test Data ScatterPlot';
const test_table = m.datasetTable(testset);
test_table.title = ' Testing Set';

const dashboard = m.dashboard({
  title: 'MoodSense - ML Expert',
  author: 'Fani Kalamara, Abel Henry-Lapassat, Michelle Dutoit'
});

//----------------------------//
//       Cross-Validation     //
//----------------------------//
var classifier = m.mlpClassifier({ layers: [128, 64, 64, 32], epochs: 15, batchSize: 32});
//.sync(store, "mlp-dash");

const params = m.modelParameters(classifier);
params.title = 'MLP Classifier parameters';

const progress = m.trainingProgress(classifier);
const cv_plot = m.trainingPlot(classifier);
const hist = history([]);

const cv_batch = m.batchPrediction("CV-batch", store);
const conf_mat = m.confusionMatrix(cv_batch);
conf_mat.title = 'Predictions Visualisation from Cross-Validation';

const progress_viz = cvProgress();

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
    progress_viz.reset();
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

		//classifier.clear();
        await classifier.train(m.iterableFromArray(train_data));
        await waitForSuccess();
        await cv_batch.predict(classifier,m.iterableFromArray(test_data));
        progress_viz.finish_fold(cv_batch, conf_mat["$accuracy"]["value"]);
    }
    var str = "train-"+hist.count;
    classifier.save(store, str);
    hist.add(str);
}

//----------------------------//
//      Testing Selection     //
//----------------------------//
const load_test = m.button('Load');
load_test.title = 'Load Selected Model';

const indic = indicator();

//this part works, but isn't linked to the selected model at all
const $features = test_input.$images
    .filter(() => toggle.$checked.get() && classifier.ready)
    .map((img) => extractor.process(img)) //might gonna change that to the loaded model...
    .awaitPromises();

const $predictions = $features
    .map((features) => classifier.predict(features))
    .awaitPromises();

const test_pred = m.confidencePlot($predictions);
test_pred.title = 'Model Prediction';

const test_batch = m.batchPrediction("test-batch", store);
const test_mat = m.confusionMatrix(test_batch);
test_mat.title = 'Model Predictions on TestSet';

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

var loaded;
load_test.$click.subscribe(() => {
    if(hist.selected!=undefined){
        loaded = hist.selected;
        indic.load(loaded);
        classifier.load(store, loaded);
    }
});

test_btn.$click.subscribe(async() => {
    if(!toggle.$checked.get()){
        await test_batch.clear();
		await test_batch.predict(classifier, testset);
    }
});

//----------------------------//
//   Dashboard Organisation   //
//----------------------------//
dashboard.page('Cross-Validation',false)
  .use([params, launch])
  .use(progress_viz)
  .use(progress)
  .use(cv_plot, conf_mat);


dashboard.page('Testing', false)
    .use(hist)
    .use([load_test, test_btn, indic, toggle])
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
  .datasets(trainset)
  .models(classifier)
  .predictions(cv_batch);

dashboard.show();
