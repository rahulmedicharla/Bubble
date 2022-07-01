import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button} from "react-native";
import { getAuth, signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux/';
import { setSignOut } from '../redux/authSlice';

export const renderProfile = ({navigation}) => {

  const auth = getAuth();
  const dispatch = useDispatch();

  const signUserOut = () => {
    signOut(auth).then(() => {
        dispatch(setSignOut());
    }).catch((error) => {
        console.log(error);
    });
  }

    return(
      <View style={styles.container}>
        <StatusBar></StatusBar>
        <Text>Profile</Text>
        <Button title = "signOut" onPress={signUserOut}></Button>
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