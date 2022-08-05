import { Text, View, StyleSheet } from "react-native";
import { AntDesign } from '@expo/vector-icons'; 

export const HeaderRightButton = ({navigation}) => {

    const goToProfile = () => {
        navigation.navigate('Profile')
    }

    return(
      <View style={styles.container}>
        <AntDesign name="user" size={25} color="black" onPress={goToProfile}></AntDesign>
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      marginRight: 20
    },
  });


