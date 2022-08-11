import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import { StyleSheet, View, Text, Button, TextInput} from "react-native";
import { useDispatch } from "react-redux";
import { setNewUserFalse } from "../redux/authSlice";
import { newUserDoc, saveUsername, setUsername } from "../redux/firestoreSlice";
import { getCurrentLocation } from "../redux/RTDatabseSlice";

export const NewUserSetupPage = ({navigation, userToken}) => {

  const dispatch = useDispatch();

  const storeUsername =  (name) => {
    if(name.length > 0){
      newUserDoc(userToken, name).then(() => {
        dispatch(setUsername({
          username: name
        }))
        dispatch(setNewUserFalse());
        dispatch(getCurrentLocation());
      })
    }else{
      alert('Please enter a username');
    }
  }  

    return(
      <View style={styles.container}>
        <StatusBar></StatusBar>
        <Text>NewUserSetup</Text>
        <Text>Set your username</Text>
        <Text>Be careful! can only set it once</Text>
        <Formik initialValues={{username: ''}} onSubmit={values => storeUsername(values.username)}>
          {({handleChange, handleSubmit, values}) => (
            <View>
            <Text>Please enter username</Text>
            <TextInput placeholder="Username" onChangeText={handleChange('username')} value = {values.username}></TextInput>
            <Button title = "Store username" onPress={handleSubmit}></Button>
          </View>
          )}
        </Formik>
        <Text>Tis simple to use</Text>
        <Text>click share button in modal to send invite link to friend - Friend will accept ord deny</Text>
        <Text>To plan event, hold down location on map to initiate event process</Text>
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