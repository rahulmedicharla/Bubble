import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';


export const HomePage = ({navigation, username}) => { 
    return(
        <View style={styles.container}>
            <StatusBar></StatusBar>
            <Text>Home</Text>
            <Text>Welcome, {username}</Text>
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