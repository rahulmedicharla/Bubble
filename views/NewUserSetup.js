import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import { StyleSheet, View, Text, Button, TextInput, ImageBackground, TouchableOpacity} from "react-native";
import { useDispatch } from "react-redux";
import { setNewUserFalse } from "../redux/authSlice";
import { newUserDoc, saveUsername, setUsername } from "../redux/firestoreSlice";
import { getCurrentLocation } from "../redux/RTDatabseSlice";
import Checkbox from 'expo-checkbox';
import { useState } from "react";
import { requestForegroundPermissionsAsync } from "expo-location";
export const NewUserSetupPage = ({navigation, userToken}) => {

  const dispatch = useDispatch();

  const [checkBoxOne, setCheckBoxOne] = useState(false);
  const [checkBoxTwo, setCheckBoxTwo] = useState(false);

  const selectColorScheme = () => {
    const colorNum = Math.floor(Math.random() * (5) + 1);

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
    }else if(colorNum == 4){
      colorScheme["color"] = "lightBlue";
      colorScheme["marker"] = require('../assets/markerColors/lightBlueMarker.png');
      colorScheme["backgroundColor"] = '#DCEEF1';
      colorScheme["textColor"] = '#47B7F1';
    }else{
      colorScheme["color"] = "orange";
      colorScheme["marker"] = require('../assets/markerColors/orangeMarker.png');
      colorScheme["backgroundColor"] = '#FFD9C9';
      colorScheme["textColor"] = '#E58359';
    }

    return colorScheme;
  }

  const loadApp = async(name, colorScheme) => {
    const { status } = await requestForegroundPermissionsAsync();
    dispatch(setUsername({
      username: name,
      colorScheme: colorScheme,
      isLoaded: true
    }))
    dispatch(setNewUserFalse());
    dispatch(getCurrentLocation(status));
  }

  const storeUsername =  (name) => {
    if(name.length > 0){
      const colorScheme = selectColorScheme();
      if(checkBoxOne && checkBoxTwo){
        newUserDoc(userToken, name, colorScheme).then(() => {
          loadApp(name, colorScheme);
        }) 
      }else{
        alert('Please accept terms and conditions')
      }
    }else{
      alert('Please enter a username');
    }
  }  

    return(
      <ImageBackground style={styles.backgroundImg} source={require('../assets/background.png')}>
        <StatusBar></StatusBar>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>Create username</Text>
          <Text style={styles.mediumText}>This is how others will see you</Text>
          <Text style={styles.smallText}>Be careful! You can't change this once it's set</Text>
        </View>
        <Formik initialValues={{username: ''}} onSubmit={values => storeUsername(values.username)}>
          {({handleChange, handleSubmit, values}) => (
            <View style = {styles.inputContainer}>
              <TextInput style={styles.usernameInput} placeholder="Username" onChangeText={handleChange('username')} value = {values.username}></TextInput>
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
              <TouchableOpacity style={styles.buttonBackground} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ImageBackground>
    );
}

const styles = StyleSheet.create({
    allCheckBoxes: {
      marginTop: 50
    },
    textContainer:{
      alignItems: 'center'
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
    backgroundImg: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    titleText:{
      fontFamily: 'TextBold',
      color: '#454A4D',
      fontSize: 20
    },
    mediumText:{
      marginTop: 10,
      fontFamily: 'TextBold',
      color: '#454A4D',
      fontSize: 15
    },
    smallText:{
      fontFamily: 'TextLight',
      color: "#6D7377",
      fontSize: 13,
      marginTop: 40
    },
    usernameInput: {
      backgroundColor: '#FFFFFF99',
      borderRadius: 5,
      paddingLeft: 15,
      paddingTop: 17,
      paddingBottom: 17,
      marginTop: 20,
      width: '80%',
      fontFamily: 'TextBold',
      fontSize: 15,
      color: '#454A4D'
    },
    inputContainer:{
      width: '100%',
      alignItems: 'center'
    },
    buttonText: {
      textAlign: 'center',
      paddingLeft : 130,
      paddingRight : 130,
      marginTop: 17,
      marginBottom: 17,
      fontSize: 20,
      fontFamily: 'TextBold',
      color: '#FFFFFF'
    },
    buttonBackground: {
      backgroundColor : '#58C4CB',
      marginTop: 120,
      borderRadius:10,
      borderColor: '#58C4CB'
    },
    centerText:{
      width: '100%',
      alignItems: 'center',
      marginLeft: 25
    }
  });