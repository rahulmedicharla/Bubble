import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getAuth } from 'firebase/auth';

export const renderHome = () => {   
    const auth = getAuth();

    console.log(auth.currentUser);

    return(
        <View style={styles.container}>
            <StatusBar></StatusBar>
            <Text>Home</Text>
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