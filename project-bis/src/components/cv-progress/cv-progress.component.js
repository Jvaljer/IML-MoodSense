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
			this.view.$set({ accs:this.accs, count:this.count, fold_done:this.fold_done });
		}
	}

	fold_done(i){
		return (this.folds[i]!=null);
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
				accs: this.accs
			}
		});
	}
}
