import { createAction, createReducer, createSlice } from "@reduxjs/toolkit"
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
    pendingFriend: {},
    pendingFriendToken: null,
    pendingFriendStatus: null,
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
        },
        setPendingFriend: (state, action) => {
            state.pendingFriend = action.payload.pendingFriend;
            state.pendingFriendStatus = action.payload.pendingFriendStatus;
            state.pendingFriendToken = action.payload.pendingFriendToken;
        },
        setPendingFriendToken: (state,action) => {
            state.pendingFriendToken = action.payload.pendingFriendToken;
        },
        setPendingStatus: (state, action) => {
            state.pendingFriendStatus = action.payload.pendingFriendStatus;
        },
        resetPendingFriendRequest: (state) => {
            state.pendingFriendToken = null;
            state.pendingFriend = {};
            state.pendingFriendStatus = null;
        }
    },
    
});

export const { setFriendsLocation, setCurrentLocation, setPendingFriend, setPendingFriendToken, setPendingStatus, resetPendingFriendRequest} = RTDatabaseSlice.actions;

export const selectCurrentLocation = (state) => state.realtimeDatabase.loc;
export const selectFriendsLocation = (state) => state.realtimeDatabase.friendsLocation;
export const selectFriendToken = (state) => state.realtimeDatabase.friendToken;
export const selectIsLive = (state) => state.realtimeDatabase.isLive;
export const selectPendingFriendToken = (state) => state.realtimeDatabase.pendingFriendToken;
export const selectPendingFriend = (state) => state.realtimeDatabase.pendingFriend;
export const selectPendingFriendStatus = (state) => state.realtimeDatabase.pendingFriendStatus;

export default RTDatabaseSlice.reducer;
