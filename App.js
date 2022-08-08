//importing firebase
import { getApp, initializeApp } from 'firebase/app';
import { firebaseConfig } from './config';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
// react redux imports
import { Provider } from 'react-redux/';
import { store } from './redux/store';
import AppRoute from './Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

//initializing firbase
const app = initializeApp(firebaseConfig); 
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})

export default function App() { 
    return(
      <Provider store={store}>
        <AppRoute></AppRoute>
      </Provider>
  );
}