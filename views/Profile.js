//react imports
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button} from "react-native";
import { TextInput } from "react-native";
import { Formik } from "formik";
import * as ImagePicker from 'expo-image-picker';
//firebase imports
import { getAuth, signOut } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
//redux imports
import { useDispatch, useSelector } from 'react-redux/';
import { setSignOut } from '../redux/authSlice';
import { useEffect, useState } from "react";
import { saveUsername, selectUsername, setUsername } from "../redux/firestoreSlice";


export const renderProfile = ({navigation}) => {

  const auth = getAuth();

  const dispatch = useDispatch();
  const username = useSelector(selectUsername);

  const [img, setImg] = useState(null);

  const storeUsername =  (name) => {
    data = {
      isLoaded: false,
      username: name
    }
    dispatch(setUsername(data));
    saveUsername(auth.currentUser.uid, name);
  }  

  useEffect(() => {
    if(img != null){
      uploadImg();
    }
    
  }, [img])

  const uploadImg = async() => {
    try{
      console.log('1');
      const storage = getStorage();
      const storageRef = ref(storage, "profilePics/" + auth.currentUser.uid);

      console.log('2')

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response); 
       };
       xhr.onerror = function() {
         reject(new TypeError('Network request failed')); 
       };
       xhr.responseType = 'blob'; 
       xhr.open('GET', img, true);  
       xhr.send(null); 
     });

      console.log('3');

      await uploadBytes(storageRef, blob).then(() => {
        console.log('success');
        getPicUrl(auth.currentUser.uid);
      }).catch((e) => {
        console.log('special' + e);
      });
    }catch(e){
      console.log(e);
  }
  }

  const getPicUrl = async(userId) => {
    const storage = getStorage();
    await getDownloadURL(ref(storage, "profilePics/" + userId)).then((url) => {
      storeProfilePic(userId, url);
    })
}

const storeProfilePic = async(userId, url) => {
    const firestore = getFirestore();
    const docRef = doc(firestore, "users", userId);

    await updateDoc(docRef, {
        profilePic: url
    })
}

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    ImagePicker.requestMediaLibraryPermissionsAsync().then(async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      }).catch((e) => {
        console.log(e);
      });

      console.log(result);
      if (!result.cancelled) {
        setImg(result.uri); 
      }
    }).catch((e) => {
      console.log(e);
    })
  };
 
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
        <Button title= "upload profile pic" onPress={pickImage}></Button>
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