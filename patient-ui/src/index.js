import '@marcellejs/core/dist/marcelle.css';
import * as m from '@marcellejs/core';

const txt = m.text('Text Component');
const wiz = m.wizard();

wiz
	.page()
	.title('First')
	.description('Try understanding the layout')
	.use(txt)
	.page()
	.title('Second')
	.description('Now understand the navigation');
;

document.querySelector('#open-wizard').addEventListener('click', () => {
	wiz.show();
});
