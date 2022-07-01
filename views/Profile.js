//react imports
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button} from "react-native";
import { TextInput } from "react-native";
import { useEffect, useState } from "react";
//firebase imports
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
//redux imports
import { useDispatch, useSelector } from 'react-redux/';
import { setSignOut } from '../redux/authSlice';

export const renderProfile = ({navigation}) => {

  const auth = getAuth();
  const firestore = getFirestore();

  const [username, setUsername] = useState('');

  const dispatch = useDispatch();

  const storeUsername = async (name) => {
    await setDoc(doc(firestore, "users", auth.currentUser.uid + ""), {
      username: name
    });
  }

  useEffect(() => {
    if(username.length == 10){
        storeUsername(username);
    } 
  },[username]);

  const signUserOut = () => {
    signOut(auth).then(() => {
        dispatch(setSignOut());
    }).catch((error) => {
        console.log(error);
    });
  }

    return(
      <View style={styles.container}>
        <StatusBar></StatusBar>
        <Text>Profile</Text>
        <Button title = "signOut" onPress={signUserOut}></Button>
        <Text>10 letter username is stored. Check HomePage!</Text>
        <TextInput placeholder="Username" onChangeText={setUsername}></TextInput>
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