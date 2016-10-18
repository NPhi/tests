export function loadState(){
	try{
		const serializedState = LocalStorage.getItem('state');
		if(serializedState === null){
			return undefined;
		}
		return JSON.parse(serializedState);
	} catch (err){
		console.error("load LocalStorage error :",err);
	}	
}

export function saveState(state){
	try{
		const serializedState = JSON.stringify(state);
		LocalStorage.setItem('state',serializedState);
	}catch(err){
		console.error("save LocalStorage error :",err);
	}
}