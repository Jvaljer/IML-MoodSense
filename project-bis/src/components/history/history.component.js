import { Component } from '@marcellejs/core';
import View from './history.view.svelte';

export class History extends Component {
	constructor(array) {
		super();
		this.title = 'Training History';
		this.list = array;
		this.selected = undefined;
		this.count = array.length;
	}

	add(name){
		this.list.push(name);
		this.count++;
	}

	Click(item){
		this.selected = item;
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
                selected: this.selected,
                count: this.count,
                Click: this.Click
			}
		});
	}
}
