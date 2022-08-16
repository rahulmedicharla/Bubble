import { StyleSheet, Image, ImageBackground } from "react-native";

export const LoadingPage = ({navigation}) => {

    return(
      <ImageBackground style={styles.container} source={require('../assets/background.png')}>
        <Image source={require('../assets/loading.gif')}></Image>
      </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%'
    },
  });


