import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Image, TouchableOpacity} from "react-native";

export const LandingPage = ({navigation}) => {

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  }
  
  return(
    <View style={styles.container}>
      <StatusBar></StatusBar>
      <Image style={styles.margin} source={require('../assets/bubbleLogo.png')}></Image>
      <Image style={styles.margin} source={require('../assets/bubbleText.png')}></Image>
      <Text style = {styles.text}>{'an IRL social :)'}</Text>
      <TouchableOpacity style={styles.buttonBackground} onPress={goToSignUp}>
        <Text style = {styles.buttonText}>Sign Up!</Text>
      </TouchableOpacity>
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
    margin: {
      marginBottom: 30
    },
    text: {
      color: '#696363',
      fontSize: 20,
      fontFamily: 'TextFont',
    },
    buttonBackground: {
      backgroundColor : '#58C4CB',
      marginTop: 150,
      borderRadius:10,
      borderColor: '#58C4CB'
    },
    buttonText: {
      textAlign: 'center',
      paddingLeft : 130,
      paddingRight : 130,
      marginTop: 9,
      marginBottom: 9,
      fontSize: 20,
      fontFamily: 'TextFont',
    }
  });