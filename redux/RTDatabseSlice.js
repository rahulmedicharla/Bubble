import { createAction, createReducer, createSlice } from "@reduxjs/toolkit"
import { child, get, getDatabase, ref } from 'firebase/database';

const initialState = {
    friendsLocation: [],
    isLive: false
}

// export const loadFriendsLocations = (userId) => {
//     console.log("trying");
//     const database = getDatabase();
//     const dbRef = ref(database);

//     const parsedLocations = [];
//     get(child(dbRef, userId + '/friends')).then((snapshot) => {
//         console.log("snapshot worked");
//         if(snapshot.exists()){
//             snapshot.forEach((child) => {
//                 const user = [];
//                 child.forEach((grandChild) => {
//                     const val = grandChild.val();
//                     const key = grandChild.key;
//                     user.push({key, val});
//                 })
//                 parsedLocations.push(user);
//             })
//         }
//     })
    
// }

const RTDatabaseSlice = createSlice({
    name: 'realtimeDatabase',
    initialState,
    reducers: {
        setFriendsLocation: (state,action) => {
            state.friendsLocation = action.payload.friends;
            state.isLive = action.payload.isLive;
        }
    },
});

export const { setFriendsLocation } = RTDatabaseSlice.actions;

export const selectFriendsLocation = (state) => state.realtimeDatabase.friendsLocation;
export const selectIsLive = (state) => state.realtimeDatabase.isLive;

export default RTDatabaseSlice.reducer;
