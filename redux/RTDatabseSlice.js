import { async } from "@firebase/util";
import { KEYBOARD_BLUR_BEHAVIOR } from "@gorhom/bottom-sheet";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from "expo-location";
import { child, get, getDatabase, push, ref, remove, set, update } from 'firebase/database';


/*

    VOTING ON LOCATION IN EVENT AND ADDING RECOMMENDATIon

*/

export const updateVote = async (creator, key, title, friendToken, pendingResponses) => {
    const db = getDatabase();

    const snapshot = await get(child(ref(db), 'events/' + creator + '/' + key + '/location'));

    let counter = 0;
    snapshot.forEach((loc) => {
        if(loc.val().title == title){
            get(child(ref(db), 'events/' + creator + '/' + key + '/location/' + counter)).then((data) => {
                let numVotes = data.val().vote + 1;
                counter--;
                update(ref(db, 'events/' + creator + '/' + key + '/location/' + counter), {
                    vote: numVotes
                })
            }).then(() => {
                get(child(ref(db), 'events/' + creator + '/' + key + '/totalVotes')).then((snapshot) => {
                    let votes = parseInt(snapshot.val());
                    votes++;
                    update(ref(db, 'events/' + creator + '/' + key), {
                        totalVotes: votes
                    })
                }).then(() => {
                    get(child(ref(db), 'events/' + creator + '/' + key + '/voteList')).then((snapshot) => {
                        let list = snapshot.val();
                        list.push(friendToken);
                        update(ref(db, 'events/' + creator + '/' + key), {
                            voteList: list
                        }).then(() => {
                            updateStatusToRerender(pendingResponses, key);
                        })
                    })
                })
            })
        }
        counter++;
    })
}

export const reccomendNewLocation = async(creator, key, friendToken, pendingResponses, location, latLng) => {
    const db = getDatabase();

    const snapshot = await get(child(ref(db), 'events/' + creator + '/' + key + '/location'));

    const locationList = snapshot.val();
    locationList.push({
        title: location,
        latLng: latLng,
        vote: 1
    })


    update(ref(db, 'events/' + creator + '/' + key), {
        location: locationList  
    }).then(() => {
        get(child(ref(db), 'events/' + creator + '/' + key + '/totalVotes')).then((snapshot) => {
            let votes = parseInt(snapshot.val());
            votes++;
            update(ref(db, 'events/' + creator + '/' + key), {
                totalVotes: votes
            })
        }).then(() => {
            get(child(ref(db), 'events/' + creator + '/' + key + '/voteList')).then((snapshot) => {
                let list = snapshot.val();
                list.push(friendToken);
                update(ref(db, 'events/' + creator + '/' + key), {
                    voteList: list
                }).then(() => {
                    updateStatusToRerender(pendingResponses, key);
                })
            })
        })
    })
}

/*

    VIEWING EVENTS OF FRIENDS

*/

const updateMyFriendsOfAnothersEvent = async (pendingReponses, name, creator, key, myToken) => {
    const db = getDatabase();

    const snapshot = await get(child(ref(db), myToken + '/friends/'));
    
    let pendingResponsesArray = [];
    for(let [key, val] of Object.entries(pendingReponses)){
        pendingResponsesArray.push(val.token);
    }

    snapshot.forEach((child) => {
        if(!pendingResponsesArray.includes(child.val().friendToken)){
            updateFriendOfEvent(child.val().friendToken, creator, key).then(() => {
                update(ref(db, 'events/' + creator + '/' + key + '/pendingResponses/'), {
                    [Object.keys(snapshot).length]: {
                        name: child.val().name,
                        token: child.val().friendToken,
                        status: 'Unanswered',
                        friendOf: name,
                        colorScheme: child.val().colorScheme
                    }
                })
            })
        }
    })
}



/*

    UPDATING MY LOC IN DATABASE

*/

export const updateLoc = (currentLoc, friendsList) => {
    const db = getDatabase();
    friendsList.map((friend) => {
        update(ref(db, friend.token + '/friends/' + friend.key), {
            latLng: currentLoc
        })
    })
}


/*

    CREATE EVENT

*/


const createGlobalEventRef = async (title, location, time, latLng, friendToken, username, colorScheme) =>{
    const db = getDatabase();

    const snapshot = await get(child(ref(db), friendToken + '/friends/'));

    let list = [];
    list.push({
        name: username,
        token: friendToken,
        status: 'Unanswered',
        colorScheme: colorScheme
    })
    snapshot.forEach((child) => {
        list.push({
            name: child.val().name,
            token: child.val().friendToken,
            status: 'Unanswered',
            colorScheme: child.val().colorScheme
        })
    })

    let locList = []
    locList.push({
        title: location,
        latLng: latLng,
        vote: 1
    })

    const newRef = ref(db, 'events/' + friendToken);
    const newPostRef = push(newRef);
    
    
    const upload = {
        title: title,
        location: locList,
        creator: {
            name: username,
            token: friendToken,
            colorScheme: colorScheme
        },
        time: time, 
        key: newPostRef.key,
        pendingResponses: list,
        deletePaths: {
            [friendToken]: newPostRef.key
        },
        totalVotes: 1,
        voteList: [friendToken]
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

export const createEvent = async (title, location, time, latLng, friendToken, friendsList, username, colorScheme) => {
    createGlobalEventRef(title, location, time, latLng, friendToken, username, colorScheme).then((key) => {
        friendsList.map((friend) => {
            updateFriendOfEvent(friend.token, friendToken, key);
        })
        updateFriendOfEvent(friendToken, friendToken, key)
    })
}

export const deleteEvent = (friendToken, key) => {
    const db = getDatabase();

    get(child(ref(db), 'events/' + friendToken + '/' + key + '/deletePaths')).then((snapshot) => {
        snapshot.forEach((child) => {
            remove(ref(db, child.key + '/pendingEvent/' + child.val()));
        })
        remove(ref(db, 'events/' + friendToken + '/' + key));
    })



}

export const updateYourStatusInEvent = (pendingResponses, creator, key, friendToken, username, newStatus) => {
    const db = getDatabase();


    get(child(ref(db), 'events/' + creator + '/' + key + '/pendingResponses/')).then((snapshot) => {
        let counter = 0;
        if(newStatus == 'Attending'){
            updateMyFriendsOfAnothersEvent(pendingResponses, username, creator, key, friendToken);
        }
        snapshot.forEach((response) => {
            if(response.val().token == friendToken){
                update(ref(db, 'events/' + creator + '/' + key + '/pendingResponses/' + counter + '/'), {
                    status: newStatus
                }).then(() => {
                    updateStatusToRerender(pendingResponses, key);
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

export const acceptFriendRequest = (myFriendToken, otherFriendToken, username, otherFriendUsername, color, myColor) => {
    const db = getDatabase();

    update(ref(db, otherFriendToken + '/pendingFriendRequest/'), {
        status: 'needsAction',
        friendToken: myFriendToken,
        username: username,
        color: myColor
    }).then(() => {
    })

    update(ref(db, myFriendToken + '/pendingFriendRequest/'), {
        status: 'fulfilled',
        friendToken: otherFriendToken,
        username: otherFriendUsername,
        color: color
    }).then(() => {
    })
}


export const addFriend = async (colorScheme, otherFriendToken, loc, username, myFriendToken) => {
    const db = getDatabase();

    const newRef = ref(db, otherFriendToken + '/friends/');

    const upload = {
        latLng: loc,
        name: username,
        friendToken: myFriendToken,
        colorScheme: colorScheme
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

export const getCurrentLocation = createAsyncThunk('realtimeDatabase/getCurrentLocation', async(status) => {
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    const location = await getCurrentPositionAsync({});
    
    const data = {
        loc:{
            latitude: parseFloat(location.coords.latitude),
            longitude: parseFloat(location.coords.longitude),
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
                    case 'colorScheme':
                        user['colorScheme'] = grandChild.val();
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
    get(child(ref(db), userId.substring(0,6))).then((snapshot) => {
        if(!snapshot.exists()){
            set(ref(db, userId.substring(0,6)), {
                friendToken: userId.substring(0,6),
                pendingFriendRequest: {
                    status: 'null'
                }
            })
        }
    });
}
/**
 * REDUX SLICE
 */

const initialState = {
    friendsLocation: [],
    eventLocations: [],
    loc: {},
    currentLocIsLoaded: false,
    friendToken: null,
    pendingFriendToken: null,
    pendingFriendUsername: null,
    pendingFriendColor: null,
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
            state.pendingFriendColor = action.payload.pendingFriendColor;
        },
        resetPendingFriend: (state) => {
            state.pendingFriendToken = null;
            state.pendingFriendUsername = null;
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

export const { setFriendToken, setCurrentLocation, setLoadFriendsLocation, setPendingFriend, setOnLoadZoomToLoc,
    resetPendingFriend, resetEventLocations, resetFriendEvents} = RTDatabaseSlice.actions;

export const selectCurrentLocation = (state) => state.realtimeDatabase.loc;
export const selectCurrentLocationIsLoaded = (state) => state.realtimeDatabase.currentLocIsLoaded;
export const selectFriendsLocation = (state) => state.realtimeDatabase.friendsLocation;
export const selectEventLocations = (state) => state.realtimeDatabase.eventLocations;
export const selectFriendToken = (state) => state.realtimeDatabase.friendToken;
export const selectPendingFriendToken = (state) => state.realtimeDatabase.pendingFriendToken;
export const selectPendingFriendUsername = (state) => state.realtimeDatabase.pendingFriendUsername;
export const selectPendingFriendColor = (state) => state.realtimeDatabase.pendingFriendColor;
export const selectOnLoadZoomToLoc = (state) => state.realtimeDatabase.onLoadZoomToLoc

export default RTDatabaseSlice.reducer;
