import { Component } from '@marcellejs/core';
import View from './loaded-indicator.view.svelte';

export class LoadedIndicator extends Component {
	constructor() {
		super();
		this.title = 'Loaded Model';
		this.loaded_run = undefined;
	}

	load(model_run){
		this.loaded_run = model_run;
		if(this.view){
			this.view.$set({ loaded_run: this.loaded_run });
		}
	}

	mount(target) {
		const t = target || document.querySelector(`#${this.id}`);
		if (!t) return;
		this.destroy();
		this.view = new View({
			target: t,
			props: {
				title: this.title,
				loaded_run: this.loaded_run
			}
		});
	}
}
