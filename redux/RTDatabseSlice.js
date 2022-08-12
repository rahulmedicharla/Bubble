import { async } from "@firebase/util";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from "expo-location";
import { child, get, getDatabase, push, ref, remove, set, update } from 'firebase/database';

/*

    UPDATING MY LOC IN DATABASE

*/

export const updateLoc = (currentLoc, updateList) => {
    const db = getDatabase();
    updateList.map((friend) => {
        update(ref(db, friend.token + '/friends/' + friend.key), {
            latLng: currentLoc
        })
    })
}


/*

    CREATE EVENT

*/


const createGlobalEventRef = async (title, location, time, latLng, friendToken, friendsList, username) =>{
    const db = getDatabase();

    let list = [];
    list.push({
        name: username,
        token: friendToken,
        status: 'Unanswered'
    })
    friendsList.map((friend) => {
        list.push({
            name: friend.name,
            token: friend.token,
            status: 'Unanswered'
        })
    })

    const newRef = ref(db, 'events/' + friendToken);
    const newPostRef = push(newRef);
    
    
    const upload = {
        title: title,
        location: location,
        creator: {
            name: username,
            token: friendToken
        },
        time: time, 
        latLng: latLng,
        key: newPostRef.key,
        pendingResponses: list
    }    

    await set(newPostRef, upload);

    return newPostRef.key;
}

const updateFriendOfEvent = (otherFriendToken, friendToken, key) => {
    const db = getDatabase();

    get(child(ref(db), otherFriendToken + '/pendingEvent/')).then((snapshot) => {
        if(snapshot.exists()){
            update(ref(db, otherFriendToken + '/pendingEvent/'), {
                [key]: {
                    friendToken: friendToken,
                    status: 0
                }
            })
        }else{
            set(ref(db, otherFriendToken + '/pendingEvent/'), {
                [key]: {
                    friendToken: friendToken,
                    status: 0
                }
            })
        }
    });
}

export const createEvent = (title, location, time, latLng, friendToken, friendsList, username) => {
    createGlobalEventRef(title, location, time, latLng, friendToken, friendsList, username).then((key) => {
        updateFriendOfEvent(friendToken, friendToken, key);
        friendsList.map((friend) => {
            updateFriendOfEvent(friend.token, friendToken, key);
        })
    })
}

export const deleteEvent = (friendsList, friendToken, key) => {
    const db = getDatabase();

    remove(ref(db, 'events/' + friendToken + '/' + key));

    remove(ref(db, friendToken + '/pendingEvent/' + key));
    friendsList.map((friend) => {
        remove(ref(db, friend.token + '/pendingEvent/' + key));
    })

}

export const updateYourStatusInEvent = async (pendingResponses, creator, key, friendToken, newStatus) => {
    const db = getDatabase();

    get(child(ref(db), 'events/' + creator + '/' + key + '/pendingResponses/')).then((snapshot) => {
        let counter = 0;
        snapshot.forEach((response) => {
            if(response.val().token == friendToken){
                update(ref(db, 'events/' + creator + '/' + key + '/pendingResponses/' + counter + '/'), {
                    status: newStatus
                }).then(() => {
                    updateStausToRerender(pendingResponses, key, friendToken);
                })
            }
            counter++;
        })
    });
}

const updateStausToRerender = (pendingResponses , key, friendToken) => {
    const db = getDatabase();
    get(child(ref(db), friendToken + '/pendingEvent/' + key + '/status')).then((val) => {
        pendingResponses.map((response) => {    
            update(ref(db, response.token + '/pendingEvent/' + key), {
                status: parseInt(val.val()) + 1
            })
        })
    })
}





/*

    ADDING USERS AS FRIENDS

*/

export const acceptFriendRequest = (myFriendToken, otherFriendToken, username, otherFriendUsername) => {
    const db = getDatabase();

    update(ref(db, otherFriendToken + '/pendingFriendRequest/'), {
        status: 'needsAction',
        friendToken: myFriendToken,
        username: username
    }).then(() => {
    })

    update(ref(db, myFriendToken + '/pendingFriendRequest/'), {
        status: 'fulfilled',
        friendToken: otherFriendToken,
        username: otherFriendUsername
    }).then(() => {
    })
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

    return newPostRef.key;

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

export const getEvents = createAsyncThunk('realtimeDatabase/getEvents', async(data) => {
    const db = getDatabase();

    const snapshot = await get(child(ref(db), '/events/' + data.val + '/' + data.key));

    const event = {
        eventData: snapshot.val()
    }

    return event;
})

export const getCurrentLocation = createAsyncThunk('realtimeDatabase/getCurrentLocation', async() => {
    const { status } = await requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    const location = await getCurrentPositionAsync({});
    
    const data = {
        loc:{
            latitude: location.coords.latitude.toFixed(7),
            longitude: location.coords.longitude.toFixed(7),
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
    eventLocations: [],
    tempEvent: null,
    loc: {},
    currentLocIsLoaded: false,
    friendToken: null,
    pendingFriendToken: null,
    pendingFriendUsername: null,
    loadEvents: true,
    onLoadZoomToLoc: true
}

const RTDatabaseSlice = createSlice({
    name: 'realtimeDatabase',
    initialState,
    reducers: {
        setFriendToken: (state, action) => {
            state.friendToken = action.payload.friendToken
        },
        setPendingFriend: (state,action) => {
            state.pendingFriendToken = action.payload.pendingFriendToken;
            state.pendingFriendUsername = action.payload.pendingFriendUsername;
        },
        resetPendingFriend: (state) => {
            state.pendingFriendToken = null;
            state.pendingFriendUsername = null;
        },
        setTempEvent: (state, action) => {
            state.tempEvent = action.payload.tempEvent
        },
        resetTempEvent: (state) => {
            state.tempEvent = null;
        },
        setLoadEvents: (state, action) => {
            state.loadEvents = action.payload.loadEvents;
        },
        resetEventLocations: (state) => {
            state.eventLocations = []
        },
        setOnLoadZoomToLoc: (state, action) => {
            state.onLoadZoomToLoc = action.payload.onLoadZoomToLoc;
        }
    },
    extraReducers: (builder) =>  {
        builder.addCase(getFriendsLocation.fulfilled, (state,action) => {
            state.friendsLocation = action.payload.friends;
        })
        builder.addCase(getCurrentLocation.fulfilled, (state,action) => {
            state.loc = action.payload.loc;
            state.currentLocIsLoaded = true;
        })
        builder.addCase(getEvents.fulfilled, (state, action) => {
            state.eventLocations.push(action.payload.eventData)
        })
    }
    
});

export const { setFriendToken, setCurrentLocation, setLoadFriendsLocation, setTempEvent, setPendingFriend, setLoadEvents, setOnLoadZoomToLoc ,resetPendingFriend, resetTempEvent, resetEventLocations} = RTDatabaseSlice.actions;

export const selectCurrentLocation = (state) => state.realtimeDatabase.loc;
export const selectCurrentLocationIsLoaded = (state) => state.realtimeDatabase.currentLocIsLoaded;
export const selectFriendsLocation = (state) => state.realtimeDatabase.friendsLocation;
export const selectEventLocations = (state) => state.realtimeDatabase.eventLocations;
export const selectTempEvent = (state) => state.realtimeDatabase.tempEvent;
export const selectFriendToken = (state) => state.realtimeDatabase.friendToken;
export const selectPendingFriendToken = (state) => state.realtimeDatabase.pendingFriendToken;
export const selectPendingFriendUsername = (state) => state.realtimeDatabase.pendingFriendUsername;
export const selectLoadEvents = (state) => state.realtimeDatabase.loadEvents;
export const selectOnLoadZoomToLoc = (state) => state.realtimeDatabase.onLoadZoomToLoc

export default RTDatabaseSlice.reducer;
