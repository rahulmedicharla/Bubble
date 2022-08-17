import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { doc, getDoc, getFirestore, updateDoc, setDoc } from "firebase/firestore";

export const getFriendsList = async(userId) => {
    const firestore = getFirestore();
    const docSnap = await getDoc(doc(firestore, 'users', userId));

    let list = [];

    if(docSnap.data().friendsList != null){

        docSnap.data().friendsList.forEach((friend) => {
            list.push(friend);
        })

    }

    return list;
}

// export const getFriendsList = createAsyncThunk('firestore/getFirestoreData', async(userId) => {
//     const firestore = getFirestore();
//     const docSnap = await getDoc(doc(firestore, 'users', userId));

//     let list = [];

//     if(docSnap.data().friendsList != null){

//         docSnap.data().friendsList.forEach((friend) => {
//             list.push(friend);
//         })

//     }

//     const data = {
//         friendsList: list,
//     }

//     return data;
// })

/*

    SETTING DATA IN REDUX STORE ON LOAD

*/

export const getFirestoreData = createAsyncThunk('firestore/getFirestoreData', async(userId) => {
    const firestore = getFirestore();
    const docSnap = await getDoc(doc(firestore, 'users', userId));

    let list = [];

    if(docSnap.data().friendsList != null){

        docSnap.data().friendsList.forEach((friend) => {
            list.push(friend);
        })

    }

    const data = {
        colorScheme: docSnap.data().colorScheme,
        username: docSnap.data().username,
        isLoaded: true,
        friendsList: list,
    }

    return data;
})
/*

    CREATING DOC FOR NEW USERS

*/

export const newUserDoc = async(userId, name, colorScheme) => {
    const firestore = getFirestore();
    await setDoc(doc(firestore, "users", userId), {
        username: name,
        colorScheme: colorScheme
    })
}

/*

    STORING DATA IN FIREBSTORE

*/

export const addFriendToList = async(userId, name, friendToken, color, key) => {
    const firestore = getFirestore();
    const docSnap = await getDoc(doc(firestore, 'users', userId));

    const list = docSnap.data().friendsList;

    if(!list){
        await updateDoc(doc(firestore, 'users', userId), {
            friendsList: [{
                token: friendToken,
                name: name,
                key: key,
                color: color
            }],
        }).then(() => {            
        })
    }else{
        list.push({
            token: friendToken,
            name: name,
            key: key,
            color: color
        });
        await updateDoc(doc(firestore, 'users', userId), {
            friendsList: list,
        }).then(() => {
        })
    }
}

export const checkIfNewUser = async (userId) => {
    const firestore = getFirestore();
    const docSnap = await getDoc(doc(firestore, 'users', userId));

    return docSnap.exists();
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
    colorScheme: {}
}

const firestoreSlice = createSlice({
    name: 'firestore',
    initialState,
    reducers: {
        setUsername: (state,action) => {
            state.isLoaded = action.payload.isLoaded;
            state.username = action.payload.username;
            state.colorScheme = action.payload.colorScheme;
        },
    },
    extraReducers: (builder) =>  {
        builder.addCase(getFirestoreData.fulfilled, (state, action) => {
            state.friendsList = action.payload.friendsList;
            state.isLoaded = true;
            state.username = action.payload.username;
            state.colorScheme = action.payload.colorScheme;
        })
    }
    
});

export const { setUsername } = firestoreSlice.actions;

export const selectUsername = (state) => state.firestore.username;
export const selectIsLoaded = (state) => state.firestore.isLoaded;
export const selectFriendsList = (state) => state.firestore.friendsList;
export const selectColorScheme = (state) => state.firestore.colorScheme;

export default firestoreSlice.reducer;
