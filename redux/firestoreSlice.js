import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { doc, getDoc, getFirestore, updateDoc, setDoc } from "firebase/firestore";
import { getStorage, uploadBytes, ref, getDownloadURL } from 'firebase/storage';

const initialState = {
    isLoaded: false,
    username: null,
    profilePic: null,
    friendToken: ""
}


/*

    STORING PROFILE PICTURE 

*/
export const uploadImg = async(userId, uri) => {

    try{
      console.log('1');
      const storage = getStorage();
      const storageRef = ref(storage, "profilePics/" + userId);

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
       xhr.open('GET', uri, true);  
       xhr.send(null); 
     });

      console.log('3');

      await uploadBytes(storageRef, blob).then(() => {
        console.log('success');
        getPicUrl(userId);
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

export const saveUsername = async (userId, newName) => {
    const firestore = getFirestore();
    const docRef = doc(firestore, "users", userId);

    await updateDoc(docRef, {
        username: newName
    })
}

/*

    SETTING DATA IN REDUX STORE ON LOAD

*/

export const getUsername = createAsyncThunk('firestore/getUsername', async (userId) => {
    const firestore = getFirestore();
    const docRef = doc(firestore, "users", userId);
    const docSnap = await getDoc(docRef);

    const data = {
        username: docSnap.data().username,
        isLoaded: true,
    }
    return data;
})

export const getProfilePic = createAsyncThunk('firestore/getProfilePic', async(userId) => {
    const firestore = getFirestore();
    const docRef = doc(firestore, "users", userId);
    const docSnap = await getDoc(docRef);

    const data = {
        profilePic: docSnap.data().profilePic,
    }
    return data;
})

/*

    CREATING DOC FOR NEW USERS

*/
const createDoc = async(userId) => {
    const firestore = getFirestore();
    await setDoc(doc(firestore, "users", userId), {
        username: userId,
        friendToken: userId.substring(0,6)
    })
}

export const newUserDoc = async(userId) => {
    const firestore = getFirestore();
    const docRef = doc(firestore, "users", userId);
    const docSnap = await getDoc(docRef);

    if(!docSnap.exists()){
        createDoc(userId);
    }
}


const firestoreSlice = createSlice({
    name: 'firestore',
    initialState,
    reducers: {
        setUsername: (state,action) => {
            state.isLoaded = action.payload.isLoaded;
            state.username = action.payload.username;
        }
    },
    extraReducers: (builder) =>  {
        builder.addCase(getUsername.fulfilled, (state,action) => {
            return Object.assign({}, state, {username: action.payload.username, isLoaded: action.payload.isLoaded})
        })
        builder.addCase(getProfilePic.fulfilled, (state,action) => {
            return Object.assign({}, state, {profilePic: action.payload.profilePic})
        })
    }
    
});

export const { setUsername } = firestoreSlice.actions;

export const selectUsername = (state) => state.firestore.username;
export const selectIsLoaded = (state) => state.firestore.isLoaded;
export const selectProfilePic = (state) => state.firestore.profilePic;

export default firestoreSlice.reducer;
