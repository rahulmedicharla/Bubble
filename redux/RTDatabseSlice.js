import { async } from "@firebase/util";
import { KEYBOARD_BLUR_BEHAVIOR } from "@gorhom/bottom-sheet";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from "expo-location";
import { child, get, getDatabase, push, ref, remove, set, update } from 'firebase/database';

/*

    VIEWING EVENTS OF FRIENDS

*/

export const rsvpToAnothersEvent = (creator, key, username, friendToken, pendingResponses, friendOf, friendOfToken, friendsList) => {
    const db = getDatabase();

    get(child(ref(db), 'events/' + creator + '/' + key + '/pendingResponses/')).then((snapshot) => {
        update(ref(db, 'events/' + creator + '/' + key + '/pendingResponses/'), {
            [Object.keys(snapshot).length -1]: {
                name: username,
                token: friendToken,
                status: 'Attending',
                friendOf: friendOf
            }
        }).then(() => {
            updateFriendOfEvent(friendToken, creator, key).then(() => {
                
                remove(ref(db, friendToken + '/friendsPendingEvent/' + friendOfToken));

                updateMyFriendsOfAnothersEvent(pendingResponses, friendsList, username,creator, key, friendToken);

                updateStatusToRerender(pendingResponses, key);
            })
        })
    }); 
}

const updateMyFriendsOfAnothersEvent = (pendingReponses, friendsList, name, creator, key, myToken) => {
    const db = getDatabase();

    const tokenArray = friendsList.map((friend) => {return friend.token})
    
    let pendingResponsesArray = [];
    for(let [key, val] of Object.entries(pendingReponses)){
        pendingResponsesArray.push(val.token);
    }


    tokenArray.map((friend) => {
        if(!pendingResponsesArray.includes(friend)){
            get(child(ref(db), friend + '/friendsPendingEvent/')).then((snapshot) => {
                if(snapshot.exists()){
                    update(ref(db, 'events/' + creator + '/' + key + '/deletePaths'), {
                        [friend]: key
                    }).then(() => {
                        update(ref(db, friend + '/friendsPendingEvent/'), {
                            [myToken]: {
                                name: name,
                                path: creator + '/' + key
                            }
                        })
                    })
                }else{
                    update(ref(db, 'events/' + creator + '/' + key + '/deletePaths'), {
                        [friend]: key
                    }).then(() => {
                        console.log('also running');
                        set(ref(db, friend + '/friendsPendingEvent/'), {
                            [myToken]: {
                                name: name,
                                path: creator + '/' + key
                            }
                        })
                    })
                }
            });
        }
    })
}



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
        status: 'Attending'
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
        pendingResponses: list,
        deletePaths: {
            [friendToken]: newPostRef.key
        }
    }    

    await set(newPostRef, upload);

    return newPostRef.key;
}

const updateFriendOfEvent = async(otherFriendToken, friendToken, key) => {
    const db = getDatabase();

    get(child(ref(db), otherFriendToken + '/pendingEvent/')).then((snapshot) => {
        if(snapshot.exists()){
            update(ref(db, otherFriendToken + '/pendingEvent/'), {
                [key]: {
                    friendToken: friendToken,
                    status: 0,
                }
            })
            update(ref(db, 'events/' + friendToken + '/' + key + '/deletePaths'), {
                [otherFriendToken]: key
            })
        }else{
            set(ref(db, otherFriendToken + '/pendingEvent/'), {
                [key]: {
                    friendToken: friendToken,
                    status: 0,
                }
            })
            update(ref(db, 'events/' + friendToken + '/' + key + '/deletePaths'), {
                [otherFriendToken]: key
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

export const deleteEvent = (deletePaths, friendToken, key) => {
    const db = getDatabase();

    remove(ref(db, 'events/' + friendToken + '/' + key));

    for(let [key, val] of Object.entries(deletePaths)) {
        remove(ref(db, key + '/pendingEvent/' + val));
        remove(ref(db, key + '/friendsPendingEvent/' + val));
    }

}

export const updateYourStatusInEvent = (pendingResponses, creator, key, friendToken, friendsList, username, newStatus) => {
    const db = getDatabase();


    get(child(ref(db), 'events/' + creator + '/' + key + '/pendingResponses/')).then((snapshot) => {
        let counter = 0;
        if(newStatus == 'Attending'){
            updateMyFriendsOfAnothersEvent(pendingResponses, friendsList, username, creator, key, friendToken);
        }
        snapshot.forEach((response) => {
            if(response.val().token == friendToken){
                update(ref(db, 'events/' + creator + '/' + key + '/pendingResponses/' + counter + '/'), {
                    status: newStatus
                }).then(() => {
                    updateStatusToRerender(pendingResponses, key, friendToken);
                })
            }
            counter++;
        })
    });
}

const updateStatusToRerender = (pendingResponses , key) => {
    const db = getDatabase();
    pendingResponses.map((response) => {
        get(child(ref(db), response.token + '/pendingEvent/' + key + '/status')).then((val) => {    
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

export const getFriendsRSVPEvents = createAsyncThunk('realtimeDatabase, getFriendsRSVPEvents', async(data) => {
    const db = getDatabase();

    const snapshot = await get(child(ref(db), '/events/' + data.path));

    const event = {
        eventData: {
            origin: snapshot.val(),
            name: data.name,
            token: data.token
        }
    }

    return event;  
})

export const getEvents = createAsyncThunk('realtimeDatabase/getEvents', async(data) => {
    const db = getDatabase();

    const snapshot = await get(child(ref(db), '/events/' + data.val + '/' + data.key));

    const event = {
        eventData: {
            origin: snapshot.val(),
        },
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
    friendsEvents: [],
    loc: {},
    currentLocIsLoaded: false,
    friendToken: null,
    pendingFriendToken: null,
    pendingFriendUsername: null,
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
        resetEventLocations: (state) => {
            state.eventLocations = []
        },
        resetFriendEvents: (state) => {
            state.friendsEvents = []
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
        builder.addCase(getFriendsRSVPEvents.fulfilled, (state, action) => {
            state.friendsEvents.push(action.payload.eventData);
        })
    }
    
});

export const { setFriendToken, setCurrentLocation, setLoadFriendsLocation, setPendingFriend, setOnLoadZoomToLoc,
    resetPendingFriend, resetEventLocations, resetFriendEvents} = RTDatabaseSlice.actions;

export const selectCurrentLocation = (state) => state.realtimeDatabase.loc;
export const selectCurrentLocationIsLoaded = (state) => state.realtimeDatabase.currentLocIsLoaded;
export const selectFriendsLocation = (state) => state.realtimeDatabase.friendsLocation;
export const selectEventLocations = (state) => state.realtimeDatabase.eventLocations;
export const selectFriendsEvents = (state) => state.realtimeDatabase.friendsEvents;
export const selectFriendToken = (state) => state.realtimeDatabase.friendToken;
export const selectPendingFriendToken = (state) => state.realtimeDatabase.pendingFriendToken;
export const selectPendingFriendUsername = (state) => state.realtimeDatabase.pendingFriendUsername;
export const selectOnLoadZoomToLoc = (state) => state.realtimeDatabase.onLoadZoomToLoc

export default RTDatabaseSlice.reducer;
