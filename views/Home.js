import { StyleSheet, Text, View, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getAuth, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const renderHome = () => {    
    const auth = getAuth();

    const clearStorage = async () => {
        await AsyncStorage.clear();
    }

    const printStorage = async() => {
        let temp = await AsyncStorage.getItem('userToken');
        console.log(temp);
    }

    const signUserOut = () => {
        signOut(auth).then(() => {
            clearStorage();
        }).catch((error) => {
            console.log(error);
        });
    }

    return(
        <View style={styles.container}>
            <StatusBar></StatusBar>
            <Text>Home</Text>
            <Button title = "signOut" onPress={signUserOut}></Button>
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