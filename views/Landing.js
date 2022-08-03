import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button, Image, TouchableOpacity} from "react-native";
import * as Font from 'expo-font';
import { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import loadFonts from '../customFont';

export const LandingPage = ({navigation}) => {

  const [fontLoaded, setFontLoaded] = useState(false);

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  }

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    loadFonts().then(() => {
      SplashScreen.hideAsync();
      setFontLoaded(true);
    })
  },[])

  if(!fontLoaded){
    return null;
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
      marginRight:40,
      marginLeft:40,
      marginTop: 80,
      paddingTop: 10,
      paddingBottom:10,
      borderRadius:10,
      borderColor: '#58C4CB'
    },
    buttonText: {
      textAlign: 'center',
      paddingLeft : 100,
      paddingRight : 100,
      marginTop: 9,
      marginBottom: 9,
      fontSize: 20,
      fontFamily: 'TextFont',
    }
  });