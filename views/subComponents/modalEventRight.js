import { Text, View, StyleSheet } from "react-native";
import { AntDesign } from '@expo/vector-icons'; 

export const ModalEventRight = ({props}) => {
    return(
        <View style = {styles.container}>
            {props == false ? (
                <AntDesign name="down" size={15} color="black"></AntDesign>
            ):(
                <AntDesign name="up" size={15} color="black"></AntDesign>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      marginRight: 25
    },
  });


