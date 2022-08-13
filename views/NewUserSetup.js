import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import { StyleSheet, View, Text, Button, TextInput} from "react-native";
import { useDispatch } from "react-redux";
import { setNewUserFalse } from "../redux/authSlice";
import { newUserDoc, saveUsername, setUsername } from "../redux/firestoreSlice";
import { getCurrentLocation } from "../redux/RTDatabseSlice";
import Checkbox from 'expo-checkbox';

export const NewUserSetupPage = ({navigation, userToken}) => {

  const dispatch = useDispatch();

  const [checkBoxOne, setCheckBoxOne] = useState(false);
  const [checkBoxTwo, setCheckBoxTwo] = useState(false);

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
        <View style = {styles.allCheckBoxes}>
            <View style = {styles.checkBox}>
                <Checkbox style={styles.checkBoxStyle} color={'#75D0E3'} value={checkBoxOne} onValueChange={() => {setCheckBoxOne(!checkBoxOne)}}></Checkbox>
                <Text style={styles.checkText}>I agree to the terms and conditions</Text>
            </View>
            <View style={styles.checkBox}>
                <Checkbox style={styles.checkBoxStyle} color={'#75D0E3'} value={checkBoxTwo} onValueChange= {() => {setCheckBoxTwo(!checkBoxTwo)}}></Checkbox>
                <Text style={styles.checkText}>I promise to be a nice friend</Text>
            </View>
        </View>
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
    allCheckBoxes: {
      marginTop: 75
    },
    checkBox: {
        marginTop: 10,
        flexDirection: 'row',
    },
    checkText: {
        alignSelf: 'center',
        marginLeft: 30,
        fontFamily: 'TextLight'
    },
    checkBoxStyle: {
        width: 27,
        height: 27,
        borderRadius: 5
    },
  });