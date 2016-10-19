export function addContact(newContact){
	return {
		type: 'ADD_CONTACT',
		newContact,
	};
}

export function addNewPeer(id,newPeerContact){
	return {
		type: 'ADD_PEER_CONTACT',
		id,
		newPeerContact,
	};
}

export function removeContact(id){
	return {
		type: 'REMOVE_CONTACT',
		id,
	};
}

export function editContact(updatedContact){
	return {
		type: 'EDIT_CONTACT',
		updatedContact,
	};
}

export function addSubordinate(id,newSubordinate){
	return {
		type: 'ADD_SUBORDINATE',
		id,
		newSubordinate,
	}
}
