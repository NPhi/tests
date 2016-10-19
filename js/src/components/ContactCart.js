import {createVirtualDOM} from '../utils/virtualDOM';
import {removeContact} from '../actions/contactsActions';

import ContactEditor from './ContactEditor';
import ContactCartInfor from './ContactCartInfor';

const ContactCart = ({contact,store}) => {

	let state = {
		isHover: false,
	};

	function deleteContact(){
		store.dispatch(removeContact(contact.id));
	}

	const children = [
		createVirtualDOM('img',{src: '/images/avatar.png'}),
		ContactCartInfor({contact}),
		ContactEditor({deleteContact,isRoot : isRoot(contact)}),
	];


	return createVirtualDOM('a',{},
							createVirtualDOM('div',{className: 'contact-card'},children));
};
//REFACTOR : change to one contact helper
function isRoot(contact){
	return contact.superiorId === undefined || contact.superiorId === null;
}

export default ContactCart;
