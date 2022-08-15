import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import { StyleSheet, View, Text, Button, TextInput} from "react-native";
import { useDispatch } from "react-redux";
import { setNewUserFalse } from "../redux/authSlice";
import { newUserDoc, saveUsername, setUsername } from "../redux/firestoreSlice";
import { getCurrentLocation } from "../redux/RTDatabseSlice";
import Checkbox from 'expo-checkbox';
import { useState } from "react";
export const NewUserSetupPage = ({navigation, userToken}) => {

  const dispatch = useDispatch();

  const [checkBoxOne, setCheckBoxOne] = useState(false);
  const [checkBoxTwo, setCheckBoxTwo] = useState(false);

  const selectColorScheme = () => {
    const colorNum = Math.floor(Math.random() * (4) + 1);

    let colorScheme = {};
    if(colorNum == 1){
      colorScheme["color"] = "purple";
      colorScheme["marker"] = require('../assets/markerColors/purpleMarker.png');
      colorScheme["backgroundColor"] = '#EDDBF6';
      colorScheme["textColor"] = '#C76CFF';
    }else if(colorNum == 2){
      colorScheme["color"] = "blue";
      colorScheme["marker"] = require('../assets/markerColors/blueMarker.png');
      colorScheme["backgroundColor"] = '#E3E8F9';
      colorScheme["textColor"] = '#758DE3';
    }else if(colorNum == 3){
      colorScheme["color"] = "green";
      colorScheme["marker"] = require('../assets/markerColors/greenMarker.png');
      colorScheme["backgroundColor"] = '#D2EBE6';
      colorScheme["textColor"] = '#41BEAC';
    }else{
      colorScheme["color"] = "lightBlue";
      colorScheme["marker"] = require('../assets/markerColors/lightBlueMarker.png');
      colorScheme["backgroundColor"] = '#DCEEF1';
      colorScheme["textColor"] = '#47B7F1';
    }

    return colorScheme;
  }

  const storeUsername =  (name) => {
    if(name.length > 0){
      const colorScheme = selectColorScheme();

      newUserDoc(userToken, name, colorScheme).then(() => {
        dispatch(setUsername({
          username: name,
          colorScheme: colorScheme,
          isLoaded: true
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