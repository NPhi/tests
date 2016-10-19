import {createVirtualDOM} from '../utils/virtualDOM';
import ContactCart from './ContactCart';

const SuperiorCart = ({contacts,store}) => {
	const children = contacts.reduce((childrenArray,contact) => {
		let subs = [];

		subs.push(
			ContactCart({contact,store})
		);

		if(doContainSubs(contact)){
			subs.push(SuperiorCart({contacts : contact.subs,store}));
		}	
		
		childrenArray.push(createVirtualDOM('li',{},subs));

		return childrenArray;
	},[]);

	return createVirtualDOM('ul',{},children);
}
//REFACTOR : change to one contact helper

function doContainSubs(contact){
	return Array.isArray(contact.subs) && contact.subs.length > 0;
}

export default SuperiorCart;