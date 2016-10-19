import {createVirtualDOM} from '../utils/virtualDOM';

const ContactCartInfor = ({contact}) => {
	const {firstName,
			lastName,
			department,
			employeeId} = contact;

	const children = [
		createVirtualDOM('h3',{},fullName(firstName,lastName)),
		createVirtualDOM('span',{className: 'department'},department),
		createVirtualDOM('span',{className: 'employee-id'},employeeId),
		createVirtualDOM('span',{},'@kms-technology.com'),
	];

	return createVirtualDOM('div',{className: 'contact-card--infor'},children);
};
//REFACTOR : change to one contact helper

function fullName(first,name){
	return first + ' ' + name;
}

export default ContactCartInfor;