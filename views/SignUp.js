import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, ScrollView, Touchable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TextInput } from 'react-native';
//firebase imports
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
//react and redux special imports
import React, {useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux/';
import {setVerificationCode } from '../redux/authSlice';
//special imports
import { Formik } from 'formik';
import PhoneInput from 'react-native-phone-number-input';
import { CodeField, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { Ionicons } from '@expo/vector-icons';


export const SignUpPage = ({navigation, verificationCode}) => {
        
    const auth = getAuth();
    const app = getApp();

    const recaptchaVerifier = useRef(null);
    const phoneInput = useRef(null);
    
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: 6});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const dispatch = useDispatch();

    const goBack = () => {
        navigation.goBack();
    }

    useEffect(() => {
        if(value.length == 6){
            confirmCode(verificationCode, value);
        }
    }, [value])
    
    const sendVerification = async(num) => {
        if(phoneInput.current.isValidNumber(num)){
            try{
                const phoneProvider = new PhoneAuthProvider(auth);
                await phoneProvider.verifyPhoneNumber(num, recaptchaVerifier.current)
                .then((verificationId) => {
                    dispatch(setVerificationCode({verificationCode: verificationId}));
                });
            }catch(error){
                console.log(error);
            };
        }else{
            alert('Please enter valid phone number')
        }
    };


    const confirmCode = async(id, code) => {
        try{
            const credential = PhoneAuthProvider.credential(
                id,
                code
              );
            await signInWithCredential(auth, credential)
        }catch(error){
            alert('Invalid Verification Code');
        };
    };

    return(
        <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={styles.container}>
            <ImageBackground style={styles.backgroundImg} source={require('../assets/background.png')}>
                <StatusBar></StatusBar>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Ionicons name="arrow-back-circle" size={38} color="black" ></Ionicons>
                </TouchableOpacity>
                {verificationCode == null ? (
                    <View style={styles.align}>
                        <Text style = {styles.text}>Your Phone Number</Text>
                        <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={app.options}></FirebaseRecaptchaVerifierModal>
                        <Formik initialValues={{phoneNumber: ''}} onSubmit={values => sendVerification(values.phoneNumber)}>
                        {({handleChange, handleSubmit, values}) => (
                            <View>
                                <PhoneInput ref={phoneInput} defaultValue={values.phoneNumber} defaultCode="US" layout="first" onChangeFormattedText={handleChange('phoneNumber')} withShadow ></PhoneInput>
                                <TouchableOpacity style={styles.buttonBackground} onPress={handleSubmit}>
                                    <Text style = {styles.buttonText}>Next</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        </Formik>
                    </View>
                ):(
                    <View style={styles.align}>
                        <Text style = {styles.text}>Enter the Code</Text>
                        <CodeField ref={ref} {...props} value={value} onChangeText={setValue} cellCount={6} rootStyle={styles.codeFieldRoot}
                            keyboardType="number-pad" textContentType="oneTimeCode" renderCell={({index, symbol, isFocused}) => (
                                <Text
                                    key={index}
                                    style={[styles.cell, isFocused && styles.focusCell]}
                                    onLayout={getCellOnLayoutHandler(index)}>
                                    {symbol}
                                </Text>
                            )}
                        ></CodeField>
                        <Text style = {styles.smallText}>Didn't get a code?</Text>
                        <TouchableOpacity style={styles.resetButtonBackground}>
                            <Text style = {styles.resetButtonText}>Resend</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ImageBackground>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backgroundImg: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    backButton:{
        position: 'absolute',
        top: 50,
        left: 25
    },
    text: {
        fontFamily: 'TextBold',
        fontSize: 20,
        marginBottom: 40,
        color: '#454A4D'
    },
    align: {
        alignItems: 'center'
    },
    buttonBackground: {
        backgroundColor : '#58C4CB',
        marginTop: 150,
        borderRadius:10,
        borderColor: '#58C4CB'
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
    codeFieldRoot: {
        marginTop: 20
    },
    cell: {
      width: 50,
      height: 50,
      backgroundColor: '#D9D9D966',
      fontSize: 24,
      borderWidth: 1,
      borderColor: '#00000030',
      borderRadius: 5,
      fontFamily: 'TextNormal',
      paddingTop: 3,
      paddingBottom: 3,
      paddingRight: 15,
      paddingLeft: 15,
      marginRight: 10,
      alignContent: 'center'
    },
    focusCell: {
      borderColor: '#000',
    },
    smallText: {
        marginTop: 100,
        fontFamily: 'TextLight',
        color: '#696363',
        fontSize: 12
    },
    resetButtonBackground: {
        backgroundColor : '#58C4CB',
        borderRadius:15,
        borderColor: '#58C4CB',
        marginTop: 15
    },
    resetButtonText: {
        textAlign: 'center',
        paddingLeft : 40,
        paddingRight : 40,
        paddingTop: 7,
        paddingBottom: 7,
        marginTop: 5,
        marginBottom: 5,
        fontSize: 15,
        fontFamily: 'TextBold',
        color: '#FFFFFF'
    },
  });