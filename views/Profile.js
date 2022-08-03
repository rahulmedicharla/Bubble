//react imports
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button} from "react-native";
//firebase imports
import { getAuth, signOut } from 'firebase/auth';
//redux imports
import { useDispatch } from 'react-redux/';
import { setSignOut } from '../redux/authSlice';

export const ProfilePage = ({navigation, username, userToken, friendToken}) => {

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
        <Text>{username}</Text>
        <Button title = "signOut" onPress={signUserOut}></Button>
        <Text>Friend Token</Text>
        <Text>{friendToken}</Text>
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