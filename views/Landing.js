import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Image, TouchableOpacity, ImageBackground} from "react-native";

export const LandingPage = ({navigation}) => {

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  }

  return(
    <View style={styles.container}>
      <ImageBackground style={styles.backgroundImg} source={require('../assets/background.png')}>
        <StatusBar></StatusBar>
        <TouchableOpacity onPress={goToSignUp}>
          <Image style={styles.logo} source={require('../assets/logo.png')}></Image>
        </TouchableOpacity>
      </ImageBackground>
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
    backgroundImg: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logo: {
      marginRight: 40
    },
  });