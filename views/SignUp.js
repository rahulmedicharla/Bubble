import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TextInput } from 'react-native';
//firebase imports
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
//react and redux special imports
import React, {useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux/';
import { setSignIn, setVerificationCode } from '../redux/authSlice';
import { getFriendsList, getUsername } from '../redux/firestoreSlice';
import { checkIfNewUser, getCurrentLocation, getFriendsLocation, newUserRLDB, setFriendToken } from '../redux/RTDatabseSlice';
//special imports
import { Formik } from 'formik';
import PhoneInput from 'react-native-phone-number-input';
import { CodeField, useBlurOnFulfill, useClearByFocusCell, Cursor } from 'react-native-confirmation-code-field';


export const SignUpPage = ({navigation, verificationCode}) => {
        
    const recaptchaVerifier = useRef(null);
    
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: 6});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    useEffect(() => {
        if(value.length == 6){
            confirmCode(verificationCode, value);
        }
    }, [value])

    const auth = getAuth();
    const app = getApp();

    const dispatch = useDispatch();
    
    const sendVerification = async(num) => {
        try{
            const phoneProvider = new PhoneAuthProvider(auth);
            await phoneProvider.verifyPhoneNumber(num, recaptchaVerifier.current)
            .then((verificationId) => {
                dispatch(setVerificationCode({verificationCode: verificationId}));
            });
        }catch(error){
            alert('Please enter a valid phone number')
            console.log(error);
        };
    };


    const confirmCode = async(id, code) => {
        try{
            const credential = PhoneAuthProvider.credential(
                id,
                code
              );
            await signInWithCredential(auth, credential).then((credential) =>{

                checkIfNewUser(credential.user.uid).then((userExists) => {
                    if(userExists){
                        dispatch(setFriendToken({friendToken: credential.user.uid.substring(0,6)}))
                        dispatch(getUsername(credential.user.uid));
                        dispatch(getCurrentLocation());
    
                    }else{
                        newUserRLDB(credential.user.uid);
                        dispatch(setFriendToken({
                            friendToken: credential.user.uid.substring(0,6)
                        }))
                    }

                    const user = {
                        isLoggedIn: true,
                        userToken: credential.user.uid,
                        newUser: !userExists
                    };
                    dispatch(setSignIn(user));
                })
            });
        }catch(error){
            alert('Invalid Verification Code');
        };
    };

    return(
        <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={styles.container}>
            <StatusBar></StatusBar>

            {verificationCode == null ? (
                <View style={styles.align}>
                    <Text style = {styles.text}>Your Phone Number</Text>
                    <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={app.options}></FirebaseRecaptchaVerifierModal>
                    <Formik initialValues={{phoneNumber: ''}} onSubmit={values => sendVerification(values.phoneNumber)}>
                    {({handleChange, handleSubmit, values}) => (
                        <View>
                            <PhoneInput defaultValue={values.phoneNumber} defaultCode="US" layout="first" onChangeFormattedText={handleChange('phoneNumber')} withShadow ></PhoneInput>
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
                    <CodeField
                        ref={ref}
                        {...props}
                        value={value}
                        onChangeText={setValue}
                        cellCount={6}
                        rootStyle={styles.codeFieldRoot}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({index, symbol, isFocused}) => (
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
    text: {
        fontFamily: 'TextFont',
        fontSize: 20,
        marginBottom: 40,
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
        marginTop: 9,
        marginBottom: 9,
        fontSize: 20,
        fontFamily: 'TextFont',
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
      textAlign: 'center',
      borderRadius: 5,
      fontFamily: 'TextFont',
      paddingTop: 3,
      paddingBottom: 3,
      paddingRight: 15,
      paddingLeft: 15,
      marginRight: 10
    },
    focusCell: {
      borderColor: '#000',
    },
    smallText: {
        marginTop: 60,
        fontFamily: 'TextFont',
        color: '#696363',
        fontSize: 12
    },
    resetButtonBackground: {
        backgroundColor : '#58C4CB',
        borderRadius:10,
        borderColor: '#58C4CB',
        marginBottom: 170,
        marginTop: 7
    },
    resetButtonText: {
        textAlign: 'center',
        paddingLeft : 40,
        paddingRight : 40,
        marginTop: 5,
        marginBottom: 5,
        fontSize: 15,
        fontFamily: 'TextFont',
    },
  });