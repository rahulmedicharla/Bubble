import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from "expo-location";
import { child, get, getDatabase, push, ref, set, update } from 'firebase/database';

/*

    ADDING USERS AS FRIENDS

*/

export const acceptFriendRequest = (myFriendToken, otherFriendToken, friendsList, username, otherFriendName) => {
    const db = getDatabase();

    if(!friendsList.includes(otherFriendName)){
        update(ref(db, otherFriendToken + '/pendingFriendRequest/'), {
            status: 'needsAction',
            friendToken: myFriendToken,
            username: username
        }).then(() => {
        })
    
        update(ref(db, myFriendToken + '/pendingFriendRequest/'), {
            status: 'fulfilled'
        }).then(() => {
        })
    }else{
        alert('already friends with user');
    }
}


export const addFriend = async (otherFriendToken, loc, username, myFriendToken) => {
    const db = getDatabase();

    const newRef = ref(db, otherFriendToken + '/friends/');

    const upload = {
        latLng: loc,
        name: username,
        friendToken: myFriendToken
    }

    const newPostRef = push(newRef);
    await set(newPostRef, upload);

     //updating
    // update(newPostRef, upload).then(() => {
    //     console.log('update successful');
    // });
    
}

export const getPendingFriendRequestData = async (friendToken) => {
    const db = getDatabase();
    const dbRef = ref(db);

    const snapshot = await get(child(dbRef, friendToken + '/pendingFriendRequest/'));

    return snapshot.val();
}

export const resetMyPendingFriendRequest = async (friendToken) => {
    const db = getDatabase();
    await update(ref(db, friendToken), {
        pendingFriendRequest: {
            status: 'null'
        }
    })
}

/*

    SETTING DATA IN REDUX STORE ON LOAD

*/

export const getCurrentLocation = createAsyncThunk('realtimeDatabase/getCurrentLocation', async() => {
    const { status } = await requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    const location = await getCurrentPositionAsync({});
    
    const data = {
        loc:{
            latitude: location.coords.latitude.toFixed(3),
            longitude: location.coords.longitude.toFixed(3),
        }
    }

    return data;
})

export const getFriendsLocation = createAsyncThunk('realtimeDatabase/getFriendsLocation', async(friendToken) => {
    const db = getDatabase();
    const dbRef = ref(db);

    const snapshot = await get(child(dbRef, friendToken + '/friends/'));

    const parsedLocations = [];

    //Checking if user exists
    if(snapshot.exists()){
        //going through each child
        snapshot.forEach((child) => {
            let user = {};
            child.forEach((grandChild) => {
                switch(grandChild.key){
                    case "name":
                        user["name"] = grandChild.val();
                        break;
                    case 'friendToken':
                        user['friendToken'] = grandChild.val();
                        break;
                    default: 
                        //going through users latLng Object
                        const retreivedLoc = {};
                        grandChild.forEach((latLng) => {
                            const val = parseFloat(latLng.val());
                            const key = latLng.key;
                            retreivedLoc[key + ""] = val;
                        })
                        user["latLng"] = retreivedLoc;
                        break;
                }
            })
            parsedLocations.push(user);
        })
    }
    const data = {
        friends: parsedLocations,
        loadFriendsLocation: false
    }
    return data;
})
/**
 * NEW USER REGISTRATION IN RTDB
 */

export const newUserRLDB = (userId) => {
    const db = getDatabase();
    set(ref(db, userId.substring(0,6)), {
        friendToken: userId.substring(0,6),
        pendingFriendRequest: {
            status: 'null'
        }
    })
}

export const checkIfNewUser = async(userId) => {
    const db = getDatabase();
    const dbRef = ref(db);

    const snapshot = await get(child(dbRef, userId.substring(0,6)));

    return snapshot.exists();
}

/**
 * REDUX SLICE
 */

const initialState = {
    friendsLocation: [],
    loadFriendsLocation: true,
    loc: {},
    currentLocIsLoaded: false,
    friendToken: null,
    pendingFriendToken: null,
    pendingFriendUsername: null

}

const RTDatabaseSlice = createSlice({
    name: 'realtimeDatabase',
    initialState,
    reducers: {
        setFriendToken: (state, action) => {
            state.friendToken = action.payload.friendToken
        },
        setLoadFriendsLocation: (state, action) => {
            state.loadFriendsLocation = action.payload.loadFriendsLocation;
        },
        setPendingFriend: (state,action) => {
            state.pendingFriendToken = action.payload.pendingFriendToken;
            state.pendingFriendUsername = action.payload.pendingFriendUsername;
        },
        resetPendingFriend: (state) => {
            state.pendingFriendToken = null;
            state.pendingFriendUsername = null;
            state.loadFriendsLocation = true;
        }
    },
    extraReducers: (builder) =>  {
        builder.addCase(getFriendsLocation.fulfilled, (state,action) => {
            state.friendsLocation = action.payload.friends;
            state.loadFriendsLocation = action.payload.loadFriendsLocation;
        })
        builder.addCase(getCurrentLocation.fulfilled, (state,action) => {
            state.loc = action.payload.loc;
            state.currentLocIsLoaded = true;
        })
    }
    
});

export const { setFriendToken, setCurrentLocation, setLoadFriendsLocation, setPendingFriend, resetPendingFriend} = RTDatabaseSlice.actions;

export const selectCurrentLocation = (state) => state.realtimeDatabase.loc;
export const selectCurrentLocationIsLoaded = (state) => state.realtimeDatabase.currentLocIsLoaded;
export const selectFriendsLocation = (state) => state.realtimeDatabase.friendsLocation;
export const selectFriendToken = (state) => state.realtimeDatabase.friendToken;
export const selectLoadFriendsLocation = (state) => state.realtimeDatabase.loadFriendsLocation;
export const selectPendingFriendToken = (state) => state.realtimeDatabase.pendingFriendToken;
export const selectPendingFriendUsername = (state) => state.realtimeDatabase.pendingFriendUsername;

export default RTDatabaseSlice.reducer;
