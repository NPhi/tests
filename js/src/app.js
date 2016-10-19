import {createStore} from './utils/redux';
import {createElement} from './utils/virtualDOM';
import reducer from './reducers';
import data from './data';
import flatToHierarchy from './utils/flatToHierarchy';

import {addContact} from './actions/contactsActions';

import SuperiorCart from './components/SuperiorCart';

const store = createStore(reducer,{
	contacts: data,
});

store.subscribe(render);

render();

function render(){
	console.log(store.getState());
	const {contacts} = store.getState();

	const hier = flatToHierarchy(contacts,
	{
		parentName : 'superiorId',
		childrenName : 'subs',
		id: 'id',
	});

	console.log(hier);

	const root = document.getElementById('root');

	const App = SuperiorCart({contacts : hier,store});

	root.innerHTML = '';
	root.appendChild(createElement(App));

}
//TEST : store.dispatch
//store.dispatch(addContact({id: 30, firstName: "Trung",lastName:"Nguyen",superiorId: 2}))
