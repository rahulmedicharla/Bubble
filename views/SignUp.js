import { StyleSheet, Text, View, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TextInput } from 'react-native';
//firebase imports
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
//react and redux special imports
import React, {useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux/';
import { setSignIn } from '../redux/authSlice';

export const renderSignUp = ({navigation}) => {
    
    const [phoneNumber, setPhoneNumber] = useState("");
    const [code, setCode] = useState("");
    const [verificationId, setVerificationId] = useState(null);
    
    const recaptchaVerifier = useRef(null);

    const dispatch = useDispatch();

    const app = getApp();
    const auth = getAuth();

    function goToLanding(){
        navigation.goBack();
    }

    
    const sendVerification = async(num) => {
        try{
            const phoneProvider = new PhoneAuthProvider(auth);
            await phoneProvider.verifyPhoneNumber(num, recaptchaVerifier.current)
            .then((verificationId) => {
                setVerificationId(verificationId);
            });
        }catch(error){
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
                const user = {
                    isLoggedIn: true,
                    userToken: credential.user.uid + ""
                };

                dispatch(setSignIn(user));
              });
        }catch(error){
            console.log(error);
        };
    };
    
    useEffect(() => {
        if(phoneNumber.length == 10){
            sendVerification("+1" + phoneNumber);
        }
    },[phoneNumber]);

    useEffect(() => {
        if(code.length == 6){
            confirmCode(verificationId, code);
        }
    }, [verificationId, code]);

    return(
        <View style={styles.container}>
            <StatusBar></StatusBar>
            <Text>Sign Up</Text>
            <Button title="GoBack"onPress={goToLanding}></Button>
            <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={app.options}></FirebaseRecaptchaVerifierModal>

            <Text>Enter Phone number</Text>
            <TextInput placeholder="Phone Number"  onChangeText={setPhoneNumber} keyboardType="phone-pad" autoCompleteType="tel"></TextInput>

            <Text>Enter Verifiation code</Text>
            <TextInput placeholder="Code" onChangeText={setCode} keyboardType="number-pad"></TextInput>

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