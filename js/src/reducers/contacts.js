export default function contacts(state = [],action){
	switch(action.type){
		case 'ADD_CONTACT' : return [...state,action.newContact];

		case 'REMOVE_CONTACT' : return state.filter(contact => contact.id !== action.id);

		case 'EDIT_CONTACT' : return state.map(contact => {
			if(contact.id === action.updatedContact.id){
				return action.updatedContact;
			}
			return contact;
		});

		case 'ADD_PEER_CONTACT' : 	const {superiorId}= state.find(contact => contact.id === action.id);

								  	return [...state,
								  			Object.assign({},action.newPeerContact,{superiorId})];

		case 'ADD_SUBORDINATE' : 	return [...state,
											Object.assign({},action.newSubordinate,{superiorId : action.id})];

		default : return state;
	}
	return state;
}
