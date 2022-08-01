//react imports
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button} from "react-native";
import { TextInput } from "react-native";
import { Formik } from "formik";
//firebase imports
import { getAuth, signOut } from 'firebase/auth';
//redux imports
import { useDispatch } from 'react-redux/';
import { setSignOut } from '../redux/authSlice';
import { saveUsername, setUsername } from "../redux/firestoreSlice";

export const ProfilePage = ({navigation, username, userToken, profilePicUrl, friendToken}) => {

  const auth = getAuth();

  const dispatch = useDispatch();


  const storeUsername =  (name) => {
    const data = {
      isLoaded: false,
      username: name
    }
    dispatch(setUsername(data));
    saveUsername(userToken, name);
  }  
 
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
        <Formik initialValues={{username: ''}} onSubmit={values => storeUsername(values.username)}>
          {({handleChange, handleSubmit, values}) => (
            <View>
            <Text>Please enter username</Text>
            <TextInput placeholder="Username" onChangeText={handleChange('username')} value = {values.username}></TextInput>
            <Button title = "Store username" onPress={handleSubmit}></Button>
          </View>
          )}
        </Formik>
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