import { StyleSheet, Text, View, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export const renderHome = () => {  
    
    const printStorage = async() => {
        let temp = await AsyncStorage.getItem('userToken');
        console.log(temp);
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