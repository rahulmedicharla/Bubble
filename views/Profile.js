import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button} from "react-native";

export const renderProfile = ({navigation}) => {
    return(
      <View style={styles.container}>
        <Text>Profile</Text>
        <StatusBar></StatusBar>
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