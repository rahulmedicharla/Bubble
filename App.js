import 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer} from '@react-navigation/native';
import { StyleSheet, Text, View, Button} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TextInput } from 'react-native';
//importing firebase
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './config';
import { getAuth, PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
//importing views
import { renderHome } from './views/Home';
import { renderNearYou } from './views/NearYou';
//import { renderSignUp } from './views/SignUp';
//import { renderLanding } from './views/Landing';
import { renderProfile } from './views/Profile';
//special react imports
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


//initializing firbase
initializeApp(firebaseConfig); 
const auth = getAuth();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthContext = createContext();

/* render landing page */

const renderLanding = ({navigation}) => {
  const goToSignUp = () => {
    navigation.navigate('SignUp');
  }

  return(
    <View style={styles.container}>
      <Text>Landing</Text>
      <StatusBar></StatusBar>
      <View>
        <Button title="SignUp" onPress = {goToSignUp}></Button>
      </View>
    </View>
  );
}

/* render signupPage */

const renderSignUp = ({navigation}) => {
    
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  
  const phoneNumInput = useRef(null);
  const recaptchaVerifier = useRef(null);

  const{ signIn } = useContext(AuthContext);
  
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
            await signInWithCredential(auth, credential).then((credential) => {
              signIn(credential);
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
          <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseConfig}></FirebaseRecaptchaVerifierModal>

          <Text>Enter Phone number</Text>
          <TextInput ref={phoneNumInput} placeholder="Phone Number"  onChangeText={setPhoneNumber} keyboardType="phone-pad" autoCompleteType="tel"></TextInput>

          <Text>Enter Verifiation code</Text>
          <TextInput placeholder="Code" onChangeText={setCode} keyboardType="number-pad"></TextInput>

      </View>
  );
}

export default function App() { 

  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken = null;

      // try {
      //   userToken = await AsyncStorage.getItem('userToken');
      // } catch (error) {
      //   console.log("Getting Credntial from async storage" + error)
      // }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = useMemo(() => ({
    signIn: async (data) => {
      // In a production app, we need to send some data (usually username, password) to server and get a token
      // We will also need to handle errors if sign in failed
      // After getting token, we need to persist the token using `SecureStore`
      // In the example, we'll use a dummy token
      // try{
      //   await AsyncStorage.setItem('userToken', data.user.uid);  
      // }catch (error) {
      //   console.log("Setting Credential to AsyncStorage" + error);
      // }
      
      dispatch({ type: 'SIGN_IN', token: "sampleToken" });
    },
    signOut: () => dispatch({ type: 'SIGN_OUT' })
  }),[]
  );

  return(
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        {state.userToken == null ? (
          <Stack.Navigator screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none"}
            }}>
           <Stack.Screen name = "Landing">{renderLanding}</Stack.Screen>
           <Stack.Screen name = "SignUp">{renderSignUp}</Stack.Screen>
          </Stack.Navigator>
        ) : (
          <Tab.Navigator screenOptions={{headerShown: false}}>
          <Tab.Screen name="Home">{renderHome}</Tab.Screen>
          <Tab.Screen name="NearYou">{renderNearYou}</Tab.Screen>
          <Tab.Screen name="Profile">{renderProfile}</Tab.Screen>
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider> 
  );

  // if(auth.currentUser){
  //   return(
  //     <NavigationContainer>
  //       <Tab.Navigator screenOptions={{headerShown: false}}>
  //         <Tab.Screen name="Home">{renderHome}</Tab.Screen>
  //         <Tab.Screen name="NearYou">{renderNearYou}</Tab.Screen>
  //         <Tab.Screen name="Profile">{renderProfile}</Tab.Screen>
  //       </Tab.Navigator>
  //     </NavigationContainer>
  //   );
  // }else{
  //   return(
  //     <NavigationContainer>
  //       <Stack.Navigator screenOptions={{
  //          headerShown: false,
  //          tabBarStyle: { display: "none"}
  //          }}>
  //         <Stack.Screen name = "Landing">{renderLanding}</Stack.Screen>
  //         <Stack.Screen name = "SignUp">{renderSignUp}</Stack.Screen>
  //       </Stack.Navigator>
  //     </NavigationContainer>
  //   );
  // }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
