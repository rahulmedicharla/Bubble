//react imports
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button} from "react-native";
//firebase imports
import { getAuth, signOut } from 'firebase/auth';
//redux imports

export const ProfilePage = ({navigation, username, userToken, friendToken}) => {



  const handleAuth = () => {
    try{
      //calendar.handleAuthClick();
    }catch(e){
      console.log(e)
    }
  }

  const auth = getAuth();

 
  const signUserOut = () => {
    signOut(auth);
  }

    return(
      <View style={styles.container}>
        <StatusBar></StatusBar>
        <Text>Profile</Text>
        <Text>{username}</Text>
        <Button title = "signOut" onPress={signUserOut}></Button>
        <Text>Friend Token</Text>
        <Text>{friendToken}</Text>
        <Button title = "Signin Calendar" onPress={() => {handleAuth}}></Button>
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%'
    },
  });