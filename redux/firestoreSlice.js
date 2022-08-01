import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { doc, getDoc, getFirestore, updateDoc, setDoc } from "firebase/firestore";
import { getStorage, uploadBytes, ref, getDownloadURL } from 'firebase/storage';


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

/**
 * REDUX SLICE
 */

const initialState = {
    isLoaded: false,
    username: null,
    profilePic: null,
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
    }
    
});

export const { setUsername } = firestoreSlice.actions;

export const selectUsername = (state) => state.firestore.username;
export const selectIsLoaded = (state) => state.firestore.isLoaded;
export const selectProfilePic = (state) => state.firestore.profilePic;

export default firestoreSlice.reducer;
