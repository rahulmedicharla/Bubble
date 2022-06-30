//importing firebase
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './config';
// react redux imports
import { Provider } from 'react-redux/';
import { store } from './redux/store';
import AppRoute from './Navigation';

//initializing firbase
initializeApp(firebaseConfig); 

export default function App() { 
    return(
      <Provider store={store}>
        <AppRoute></AppRoute>
      </Provider>
  );
}