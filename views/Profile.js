//react imports
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button} from "react-native";
import { TextInput } from "react-native";
import { Formik } from "formik";
//firebase imports
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
//redux imports
import { useDispatch } from 'react-redux/';
import { setSignOut } from '../redux/authSlice';

export const renderProfile = ({navigation}) => {

  const auth = getAuth();
  const firestore = getFirestore();

  const dispatch = useDispatch();

  const storeUsername = async (name) => {
    await setDoc(doc(firestore, "users", auth.currentUser.uid + ""), {
      username: name
    });
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