import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';

export const renderHome = () => { 
    
    const firestore = getFirestore();
    const auth = getAuth();
    
    const printStorage = async() => {
        try{
            const docRef = doc(firestore, "users", auth.currentUser.uid + "");
            const docSnap = await getDoc(docRef);
            console.log(docSnap.data());
        }catch(error){
            console.log(error);
        }
    }
    return(
        <View style={styles.container}>
            <StatusBar></StatusBar>
            <Text>Home</Text>
            <Button title = "Print" onPress={printStorage}></Button>
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