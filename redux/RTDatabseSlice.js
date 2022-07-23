import { createAction, createReducer, createSlice } from "@reduxjs/toolkit"
import { child, get, getDatabase, push, ref, set, update } from 'firebase/database';


const initialState = {
    friendsLocation: [],
    isLive: false,
    friendToken: "",
    loc: {},
    uploadLocToken: false,
}

export const uploadCurrentLoc = ((friendToken, loc, username) => {
    console.log(friendToken + "..." + loc + "..." + username)

    const db = getDatabase();
    const dbRef = ref(db, friendToken + '/friends/');

    const upload = {
        latLng: loc,
        name: username
    }

    const newPostRef = push(dbRef);
    set(newPostRef, upload).then(() => {
        console.log('update successful');
    });

    //updating
    // update(newPostRef, upload).then(() => {
    //     console.log('update successful');
    // });
    

    
})

export const newUserRLDB = (userId) => {
    const db = getDatabase();
    const dbRef = ref(db);
    get(child(dbRef,userId.substring(0,6) + '/friends')).then((snapshot) => {
        if(!snapshot.exists()){
            set(ref(db, userId.substring(0,6) + '/friends'), {
                friendToken: userId.substring(0,6),
            });
            
        }
    });
}

const RTDatabaseSlice = createSlice({
    name: 'realtimeDatabase',
    initialState,
    reducers: {
        setFriendsLocation: (state,action) => {
            state.friendsLocation = action.payload.friends;
            state.isLive = action.payload.isLive;
            state.friendToken = action.payload.friendToken;
        },
        setCurrentLocation: (state, action) => {
            state.loc = action.payload.loc;
            state.uploadLocToken = action.payload.uploadLocToken;
        },
        setUploadLocTokenFalse: (state, action) => {
            state.uploadLocToken = action.payload.uploadLocToken;
        }
    },
    
});

export const { setFriendsLocation, setCurrentLocation, setUploadLocTokenFalse } = RTDatabaseSlice.actions;

export const selectCurrentLocation = (state) => state.realtimeDatabase.loc;
export const selectFriendsLocation = (state) => state.realtimeDatabase.friendsLocation;
export const selectIsLive = (state) => state.realtimeDatabase.isLive;
export const selectFriendToken = (state) => state.realtimeDatabase.friendToken;
export const selectUploadLocToken = (state) => state.realtimeDatabase.uploadLocToken

export default RTDatabaseSlice.reducer;
