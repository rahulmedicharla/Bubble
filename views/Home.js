import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useEffect, useState, useReducer } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getUsername, selectIsLoaded, selectUsername} from '../redux/firestoreSlice';

export const renderHome = () => { 
    
    const firestore = getFirestore();
    const auth = getAuth();

    const dispatch = useDispatch();
    const username = useSelector(selectUsername, shallowEqual);
    const isLoaded = useSelector(selectIsLoaded, shallowEqual);
    
    const printStorage = () => {
        try{
            const docRef = doc(firestore, "users", auth.currentUser.uid + "");
            const docSnap = await getDoc(docRef);
            console.log(docSnap.data());
            return docSnap.data().username;
        }catch(error){
            console.log(error);
        }
    }

    useEffect(() => {
        console.log(username + "..." + isLoaded);
        dispatch(getUsername(auth.currentUser.uid));
    }, [username]);

    return(
        <View style={styles.container}>
            <StatusBar></StatusBar>
            <Text>Home</Text>
            <Button title = "Print" onPress={printStorage}></Button>
            {isLoaded == false ? (
                <Text>Welcome, set your username in profile page</Text>
            ) : (
                <Text>Welcome, {username}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });