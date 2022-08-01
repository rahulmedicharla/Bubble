import { createAction, createAsyncThunk, createReducer, createSlice } from "@reduxjs/toolkit"
import { child, get, getDatabase, push, ref, set, update } from 'firebase/database';

/**
 * ADDING USERS AS FRIENDS
 */

export const updateStatusToFulfilled = (myFriendToken, otherFriendToken) => {
    const db = getDatabase();

    update(ref(db, myFriendToken + '/friends/pendingFriendRequest/'), {
        status: 'fulfilled',
    }).then(() => {
        console.log('fulfilled');
    })

    update(ref(db, otherFriendToken + '/friends/pendingFriendRequest/'), {
        status: 'fulfilled',
    }).then(() => {
        console.log('fulfilled');
    })
}

export const activatePendingFriendRequest = (myFriendToken, myName, otherFriendToken) => {
    const db = getDatabase();

    update(ref(db, myFriendToken + '/friends/'), {
        pendingFriendRequest: {
            status: 'pending',
            friendToken: otherFriendToken
        }
    }).then(() => {
        console.log('activated');
    })

    update(ref(db, otherFriendToken + '/friends/'), {
        pendingFriendRequest: {
            status: 'needsAction',
            username: myName,
            friendToken: myFriendToken
        }
    }).then(() => {
        console.log('activated');
    })

}

export const addUsersAsFriends = (otherFriendToken, loc, username, myFriendToken) => {
    const db = getDatabase();

    const newRef = ref(db, otherFriendToken + '/friends/');

    const upload = {
        latLng: loc,
        name: username,
        friendToken: myFriendToken
    }

    const newPostRef = push(newRef);
    set(newPostRef, upload).then(() => {
        console.log('added One Friend');
    })
}

/**
 * UPLOADING CURRENT DATA
 */

export const uploadCurrentLoc = ((friendToken, loc, username) => {

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

/*

    SETTING DATA IN REDUX STORE ON LOAD

*/

export const loadDatabaseData = createAsyncThunk('realtimeDatabase/loadDatabaseData', async(userId) => {
    const db = getDatabase();
    const dbRef = ref(db);

    const snapshot = await get(child(dbRef, userId.substring(0,6) + '/friends'));

    const parsedLocations = [];
    let friendToken = "";

    //Checking if user exists
    if(snapshot.exists()){
        //going through each child
        snapshot.forEach((child) => {
            switch(child.key){
                case "friendToken":
                    friendToken = child.val();
                    break;
                default: 
                    //going through friend user object
                    let user = {};
                    child.forEach((grandChild) => {
                        switch(grandChild.key){
                            case "name":
                                user["name"] = grandChild.val();
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
                    break;
            }
        })
    }
    const data = {
        friends: parsedLocations,
        isLive: true,
        friendToken: friendToken
    }
    return data;
})

/**
 * NEW USER REGISTRATION IN RTDB
 */

export const newUserRLDB = (userId) => {
    const db = getDatabase();
    const dbRef = ref(db);
    get(child(dbRef,userId.substring(0,6) + '/friends')).then((snapshot) => {
        if(!snapshot.exists()){
            set(ref(db, userId.substring(0,6) + '/friends'), {
                friendToken: userId.substring(0,6) 
            })
        }
    });
}

/**
 * REDUX SLICE
 */

const initialState = {
    friendsLocation: [],
    isLive: false,
    loc: {},
    friendToken: null,
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
        }
    },
    extraReducers: (builder) =>  {
        builder.addCase(loadDatabaseData.fulfilled, (state,action) => {
            state.friendsLocation = action.payload.friends;
            state.isLive = action.payload.isLive;
            state.friendToken = action.payload.friendToken;
        })
    }
    
});

export const { setFriendsLocation, setCurrentLocation} = RTDatabaseSlice.actions;

export const selectCurrentLocation = (state) => state.realtimeDatabase.loc;
export const selectFriendsLocation = (state) => state.realtimeDatabase.friendsLocation;
export const selectFriendToken = (state) => state.realtimeDatabase.friendToken;
export const selectIsLive = (state) => state.realtimeDatabase.isLive;

export default RTDatabaseSlice.reducer;
