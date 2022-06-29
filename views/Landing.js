import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button} from "react-native";

export const renderLanding = ({navigation}) => {
    const goToSignUp = () => {
      navigation.navigate('SignUp');
    }

    return(
      <View style={styles.container}>
        <Text>Landing</Text>
        <StatusBar></StatusBar>
        <View>
          <Button title="SignUp" onPress = {goToSignUp}></Button>
        </View>
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