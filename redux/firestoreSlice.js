import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { doc, getDoc, getFirestore, updateDoc, setDoc } from "firebase/firestore";


/*

    SETTING DATA IN REDUX STORE ON LOAD

*/

export const getFriendsList = createAsyncThunk('firestore/getFriendsList', async (userId) => {
    const firestore = getFirestore();
    const docSnap = await getDoc(doc(firestore, 'users', userId));

    let list = [];
    docSnap.data().friendsList.forEach((friend) => {
        list.push(friend);
    })

    const data = {
        friendsList: list
    }
    return data;
})

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

export const newUserDoc = async(userId, name) => {
    const firestore = getFirestore();
    await setDoc(doc(firestore, "users", userId), {
        username: name,
    })
}

/*

    STORING DATA IN FIREBSTORE

*/

export const addFriendToList = async(userId, name) => {
    const firestore = getFirestore();
    const docSnap = await getDoc(doc(firestore, 'users', userId));

    const list = docSnap.data().friendsList;

    if(!list){
        await updateDoc(doc(firestore, 'users', userId), {
            friendsList: [name]
        }).then(() => {            
        })
    }else{
        list.push(name);
        await updateDoc(doc(firestore, 'users', userId), {
            friendsList: list
        }).then(() => {
        })
    }
}

export const saveUsername = async(userId, newName) => {
    const firestore = getFirestore();
    await updateDoc(doc(firestore, "users", userId), {
        username: newName
    })
}
/**
 * REDUX SLICE
 */

const initialState = {
    isLoaded: false,
    username: null,
    friendsList: [],
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
        builder.addCase(getFriendsList.fulfilled, (state, action) => {
            return Object.assign({}, state, {friendsList: action.payload.friendsList})
        })
    }
    
});

export const { setUsername } = firestoreSlice.actions;

export const selectUsername = (state) => state.firestore.username;
export const selectIsLoaded = (state) => state.firestore.isLoaded;
export const selectFriendsList = (state) => state.firestore.friendsList;

export default firestoreSlice.reducer;
