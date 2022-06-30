import { StyleSheet, Text, View, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getAuth, signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux/';
import { setSignOut } from '../redux/authSlice';

export const renderHome = () => {  
    
    const auth = getAuth();

    const dispatch = useDispatch();

    const printStorage = async() => {
        let temp = await AsyncStorage.getItem('userToken');
        console.log(temp);
    }

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