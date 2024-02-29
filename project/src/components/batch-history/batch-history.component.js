import { Component } from '@marcellejs/core';
import View from './batch-history.view.svelte';

export class BatchHistory extends Component {
	constructor(array) {
		super();
		this.title = 'Batch History';
		this.list = array;
		this.selected = undefined;
	}

	add(){
		//must implement
	}
	remove(){
		//must implement
	}

	select(){
		//must implement
	}

	mount(target) {
		const t = target || document.querySelector(`#${this.id}`);
		if (!t) return;
		this.destroy();
		this.$$.app = new View({
			target: t,
			props: {
				title: this.title,
				list: this.list,
				selected: this.selected
			}
		});
	}
}
