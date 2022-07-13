import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getAuth } from 'firebase/auth';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsername, selectUsername} from '../redux/firestoreSlice';

export const renderHome = () => { 
    
    const auth = getAuth();

    const dispatch = useDispatch();
    const username = useSelector(selectUsername)

    useEffect(() => {
        console.log(username);   
    }, [username]);

    return(
        <View style={styles.container}>
            <StatusBar></StatusBar>
            <Text>Home</Text>
            {username == null ? (
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