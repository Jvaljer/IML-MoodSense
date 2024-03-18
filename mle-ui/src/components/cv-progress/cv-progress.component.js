import { Component } from '@marcellejs/core';
import View from './cv-progress.view.svelte';

export class CvProgress extends Component {
	constructor() {
		super();
		this.title = 'Cross-Validation Progress';
		this.count = 0;
		this.folds = [];
		this.accs = [];
	}

	reset(){
		this.count = 0;
		this.folds = [];
		this.accs = [];
	}

	finish_fold(f, acc){
		this.folds.push(f);
		this.accs.push(acc);
		this.count++;
		if(this.view){
			this.view.$set({ accs:this.accs, count:this.count, fold_done:this.fold_done, mean_acc:this.mean_acc });
		}
	}

	fold_done(i){
		return (this.folds[i]!=null);
	}

	mean_acc(){
		const a1 = this.accs[0];
		const a2 = this.accs[1];
		const a3 = this.accs[2];

		const mean = (a1+a2+a3)/3;
		console.log("mean rounded: "+mean.toFixed(2));
		//return mean.toFixed(2);
		return parseFloat(mean.toFixed(2));
	}

	mount(target) {
		const t = target || document.querySelector(`#${this.id}`);
		if (!t) return;
		this.destroy();
		this.view = new View({
			target: t,
			props: {
				title: this.title,
				count: this.count,
				folds: this.folds,
				fold_done: this.fold_done,
				accs: this.accs,
				mean_acc: this.mean_acc
			}
		});
	}
}
