import {createVirtualDOM} from '../utils/virtualDOM';

const ContactEditor = ({deleteContact,isRoot = false}) => {
	const children = [
		createVirtualDOM('button',{},'Edit'),
		(isRoot ? '' : createVirtualDOM('button',{},'Peer')),
		createVirtualDOM('button',{},'Sub'),
		(isRoot ? '' : createVirtualDOM('button',{onClick : deleteContact},'Delete')),
	];
	return createVirtualDOM('div',{className: 'contact-btns'},children);
};

export default ContactEditor;