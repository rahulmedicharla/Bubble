import { Text, View, StyleSheet, Image } from "react-native";
import { AntDesign } from '@expo/vector-icons'; 

export const LoadingPage = ({navigation}) => {

    return(
      <View style={styles.container}>
        <Text>LoadingPage</Text>
        <Image source={require('../assets/loading.gif')}></Image>
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


