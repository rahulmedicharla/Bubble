import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { doc, getDoc, getFirestore } from "firebase/firestore";

const initialState = {
    isLoaded: false,
    username: null
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

const firestoreSlice = createSlice({
    name: 'firestore',
    initialState,
    reducers: {},
    extraReducers: (builder) =>  {
        builder.addCase(getUsername.fulfilled, (state,action) => {
            return Object.assign({}, state, {username: action.payload.username, isLoaded: action.payload.isLoaded})
        })
    }
});

export const selectUsername = (state) => state.firestore.username;
export const selectIsLoaded = (state) => state.firestore.isLoaded;

export default firestoreSlice.reducer;
