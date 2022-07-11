import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { doc, getDoc, getFirestore, updateDoc, setDoc } from "firebase/firestore";
import { getStorage, uploadBytes, ref, getDownloadURL } from 'firebase/storage';

const initialState = {
    isLoaded: false,
    username: null,
}

export const saveUsername = async (userId, newName) => {
    const firestore = getFirestore();
    const docRef = doc(firestore, "users", userId);

    await updateDoc(docRef, {
        username: newName
    })
}

export const getUsername = createAsyncThunk('firestore/getUsername', async (userId) => {
    const firestore = getFirestore();
    const docRef = doc(firestore, "users", userId);
    const docSnap = await getDoc(docRef);

    const data = {
        username: docSnap.data().username,
        isLoaded: true
    }
    return data;
})

const createDoc = async(userId) => {
    const firestore = getFirestore();
    await setDoc(doc(firestore, "users", userId), {
        username: userId
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
    }
});

export const { setUsername } = firestoreSlice.actions;

export const selectUsername = (state) => state.firestore.username;
export const selectIsLoaded = (state) => state.firestore.isLoaded;

export default firestoreSlice.reducer;
