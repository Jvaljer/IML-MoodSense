import { Component } from '@marcellejs/core';
import View from './mood-reviewer.view.svelte';

export class MoodReviewer extends Component {
	constructor() {
		super();
		this.instance = undefined;
		this.mood = '';
	}

	SetInstance(inst){
		this.instance = inst;
		this.mood = inst.y;

		if(this.view){
			this.view.$set({ ChangeMood: this.ChangeMood, mood: this.mood });
		}
	}

	ChangeMood(m){
		this.instance.y = m;
		this.mood = m;
		if(this.view){
			this.view.$set({ ChangeMood: this.ChangeMood, mood: this.mood });
		}
	}

	mount(target) {
		const t = target || document.querySelector(`#${this.id}`);
		if (!t) return;
		this.destroy();
		this.view = new View({
			target: t,
			props: {
				instance: this.instance,
				ChangeMood: this.ChangeMood,
				mood: this.mood
			}
		});
	}
}
