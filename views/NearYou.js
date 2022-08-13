//react imports
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Button, Text, TextInput, TouchableOpacity, Share, Keyboard, Image, ImageBackground, ScrollView } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Formik } from "formik";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons';

//redux imports
import { acceptFriendRequest, addFriend, createEvent, deleteEvent, getCurrentLocation, getEvents, getFriendsLocation, getPendingFriendRequestData, resetEventLocations, resetMyPendingFriendRequest, resetPendingFriend, resetTempEvent, setLoadEvents, setOnLoadZoomToLoc, setTempEvent, updateLoc, updateYourStatusInEvent } from '../redux/RTDatabseSlice';
import { useDispatch } from 'react-redux';
import { getDatabase, off, onValue, ref, update } from 'firebase/database';
import { addFriendToList, getFriendsList } from '../redux/firestoreSlice';

//Sharing imports
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

//https://github.com/react-native-maps/react-native-maps
//https://gorhom.github.io/react-native-bottom-sheet/modal/usage

export const NearYouPage = ({navigation, userToken, friendsLocation, tempEvent, eventLocations, friendToken,
  username, friendsList, updateList, pendingFriendToken, pendingFriendUsername, onLoadZoomToLoc, currentLoc}) => {

  const db = getDatabase();

  //view states
  const [eventSelectionVisible,setEventSelectionVisible] = useState(false); 

  const [showCreateEventData, setCreateEventData] = useState(false);
  const [showViewEventData, setShowViewEventData] = useState(false);
  const [showAddFriendData, setShowAddFriendData] = useState(false);

  const [eventSelectionButtonVisible, setEventSelectionButtonVisible] = useState(true);

  //react temp consts
  const map = useRef(null);
  const tempEventRef = useRef(null);
  const timeInput = useRef(null);

  //AddFriends Modal Consts
  const sheetRef = useRef(null);
  const snapPoints = ["50%", "80%"];

  const dispatch = useDispatch();

  const isValidRequest = () => {
    const tokenArray = friendsList.map((friend) => {return friend.token})
    if(!tokenArray.includes(pendingFriendToken)){
      acceptFriendRequest(friendToken, pendingFriendToken, username, pendingFriendUsername)
  }else{
      alert('already friends with user');
      denyFriendRequest();
  }
  }

  const denyFriendRequest = () => {
    dispatch(resetPendingFriend());
  }

  const shareFriendToken = (friendToken, username) => {
    const link = Linking.createURL('pendingFriendRequest', {
      queryParams: {
        friendToken: friendToken,
        username: username
      }
    });
    Share.share(
      {
        message: 'Add Friend Invite',
        title: 'test, dont know where this will go',
        url: link
      })
  }

  /**
   * 
   * EVENT LISTENERS
   * 
   */

  useEffect(() => {

    // KEYBOARD LISTENERS
    const keyboardOn = Keyboard.addListener('keyboardWillShow', () => {
      sheetRef.current.expand();
    })
    const keyboardOff = Keyboard.addListener('keyboardWillHide', () => {
      sheetRef.current.collapse();
    })

    // EVENTS WITH FRIENDS

    const eventsData = ref(db, friendToken + '/pendingEvent/');
    onValue(eventsData, (snapshot) => {
      dispatch(resetEventLocations())
      if(snapshot.exists()){
        snapshot.forEach((child) => {
          dispatch(getEvents({
            key: child.key,
            val: child.val().friendToken
          }))
        })
      }
    })

    // FRIENDS LOCATIONS

    const friendsLocationData = ref(db, friendToken + '/friends/');
     onValue(friendsLocationData, (snapshot) => {
      dispatch(getFriendsLocation(friendToken));
    })

    //PENDING FRIEND REQUEST

    const pendingFriendRequest = ref(db, friendToken + '/pendingFriendRequest/status');
    onValue(pendingFriendRequest, (snapshot) => {
      if(snapshot.val() == 'fulfilled'){
        getPendingFriendRequestData(friendToken).then((data) => {
          addFriend(data.friendToken, currentLoc, username, friendToken).then((key) => {
            addFriendToList(userToken, data.username, data.friendToken, key).then(() => {
              resetMyPendingFriendRequest(friendToken);
              dispatch(getFriendsList(userToken));
              dispatch(resetPendingFriend());
            });
          })
        })
      }else if(snapshot.val() == 'needsAction'){
        getPendingFriendRequestData(friendToken).then((data) => {
          addFriend(data.friendToken, currentLoc, username, friendToken).then((key) => {
            addFriendToList(userToken, data.username, data.friendToken, key).then(() => {
              resetMyPendingFriendRequest(friendToken);
              dispatch(getFriendsList(userToken));
              dispatch(resetPendingFriend());
            });
          })
        })
      }
    })

    return () => {
      keyboardOn.remove();
      keyboardOff.remove();

      off(eventsData);
      off(friendsLocationData);
      off(pendingFriendRequest)
    }


  }, [username])

  /**
   * USE EFFECTS
   */
  useEffect(() => {
    if(currentLoc && onLoadZoomToLoc){
      map.current.animateToRegion({
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        latitudeDelta: .008,
        longitudeDelta: .008,
      }, 1000)
      dispatch(setOnLoadZoomToLoc({onLoadZoomToLoc: false}))
    }
    //timer to update loc
    // if(updateList != null && updateList.length > 0){
    //   const timer = setTimeout(() => {
    //     dispatch(getCurrentLocation()).then(() => {
    //       console.log('updating');
    //       updateLoc(currentLoc, updateList);
    //     });
    //   }, 60000)
  
    //   return () => {
    //     clearTimeout(timer);
    //   }
    // }
  }, [currentLoc, updateList, onLoadZoomToLoc])

  const createTempEvent = (e) => {
    const data = {
      tempEvent: {
        latLng: {
          latitude: parseFloat(e.nativeEvent.coordinate.latitude), 
          longitude: parseFloat(e.nativeEvent.coordinate.longitude)
        }
      }
    }
    dispatch(setTempEvent(data))
  }

  const changeTempToPermanentEvent = (title, location, time, latLng, friendToken, friendsList, username) => {
    sheetRef.current.close();
    dispatch(resetTempEvent());
    dispatch(setLoadEvents({loadEvents: true}));
    createEvent(title, location, time, latLng, friendToken, friendsList, username)
  }

  const cancelTempMarker = () => {
    dispatch(resetTempEvent());
  }

  return(
      <View style={styles.container}>
        <StatusBar></StatusBar>
        <MapView style={styles.map} showsUserLocation ref={map} onLongPress={(e) => createTempEvent(e)}>
          {friendsLocation.map(marker => {
            return (<Marker title={marker.name} key={marker.friendToken} coordinate={marker.latLng}></Marker>)
          })}
          {eventLocations.map(marker => {
            return (<Marker title={marker.title} key={marker.title} coordinate={marker.latLng}>
              <Callout>
                <Text>{marker.title} @ {marker.time} @ {marker.location}</Text>
                <Text>Created by {marker.creator.name}</Text>
              </Callout>
            </Marker>)
          })}
          {tempEvent != null ? (
            <Marker ref={tempEventRef} key='tempEvent' coordinate={tempEvent.latLng}>
              <Callout onPress={cancelTempMarker}>
                <MaterialIcons name="cancel" size={24} color="black"></MaterialIcons>
              </Callout>
            </Marker>
          ):null}
        </MapView>
        <BottomSheet handleStyle={{backgroundColor: '#E8E4F4'}}  ref={sheetRef} snapPoints={snapPoints} enablePanDownToClose index={-1} onClose={() => {
          Keyboard.dismiss();
          setEventSelectionButtonVisible(true);
        }}>
          <BottomSheetView>
            <ImageBackground style= {styles.modalBackground} source={require('../assets/background.png')}>
              {/* SHOW ADD FRIEND DATA */}
              {showAddFriendData == true ? (
                <View>
                  <Text>Friends</Text>
                  {friendsList.map(friend => {
                    return (<Text key={friend.token}>{friend.token} + {friend.name}</Text>)
                  })}
                  <TouchableOpacity onPress={() => shareFriendToken(friendToken, username)}>
                    <MaterialCommunityIcons name="share" size={40} color="black"></MaterialCommunityIcons>
                  </TouchableOpacity>
                  {pendingFriendToken != null ? (
                      <View>
                        <Text>Accept Friend Request from {pendingFriendUsername}</Text>
                        <Button title= "accept" onPress={isValidRequest}></Button>
                        <Button title = "deny" onPress={denyFriendRequest}></Button>
                      </View>
                  ):null}
                </View>
              ):null}

              {/* SHOW CREATE EVENT DATA */}
              {showCreateEventData == true ? (
                <Formik initialValues={{title: '', location: '', time: ''}} onSubmit={(values) => {changeTempToPermanentEvent(values.title, values.location, values.time, tempEvent.latLng, friendToken, friendsList, username)}}>
                {({handleChange, handleSubmit, values}) => (
                  <View style = {styles.modalViewContainer}>
                    <Text style = {styles.createEventText}>Create Event</Text>
                    <View style={styles.createEventContainer}>
                      <TextInput style={[styles.createEventInputs, styles.createEventName]} placeholderTextColor='#AFB9BF' placeholder="Name the event" onChangeText={handleChange('title')} value = {values.title}></TextInput>
                      <Text style = {[styles.createEventText, styles.atText]}>at</Text>
                      <TextInput ref={timeInput} style={[styles.createEventInputs, styles.createEventTime]} placeholderTextColor='#AFB9BF' keyboardType={'number-pad'} placeholder="0:00" onChangeText={handleChange('time')} value = {values.time}></TextInput>
                    </View>
                    <View style={styles.createEventContainer}>
                      <TextInput style={[styles.createEventInputs, styles.createEventLocation]} placeholderTextColor='#AFB9BF' placeholder="Suggest a Location" onChangeText={handleChange('location')} value = {values.location}></TextInput>
                    </View>
                    <TouchableOpacity style={styles.createEventButton} onPress={handleSubmit}>
                      <Image style={styles.selectionEmoji} source={require('../assets/emojis/createEvent.png')}></Image>
                      <Text style = {styles.selectionText}>Create Event</Text>
                    </TouchableOpacity>
                    <Text style = {styles.smallText}>Once you create, your friends will be notified</Text>
                  </View>
                )}
                </Formik>
              ):null}

              {/* SHOW VIEW EVENTS DATA */}
              {showViewEventData == true ? (
                <View>
                  {eventLocations.map((event) => {
                    return (
                      <View key={event.key}>
                        <Text>{event.title} at {event.location} @ {event.time}</Text>
                        <Text>Created by {event.creator.name}</Text>
                        {event.pendingResponses.map((response) => {
                          if(response.token == friendToken && response.status == 'Unanswered' ){
                            return (
                            <View key = {response.token}>
                              <Text>You are {response.status}</Text>
                              <Button title = "Attend" onPress={() => {updateYourStatusInEvent(event.pendingResponses, event.creator.token, event.key, friendToken, 'Attending')}}></Button>
                              <Button title = "Dont Attend" onPress={() => {updateYourStatusInEvent(event.pendingResponses, event.creator.token, event.key, friendToken, 'Not Attending')}}></Button>
                            </View>);
                          }else{
                            return (<Text key = {response.token}>{response.token} +  {response.name} is {response.status}</Text>)
                          }
                        })}
                        {event.creator.token == friendToken ? (
                          <View>
                            <Button title = "Delete Event" onPress={() => {deleteEvent(friendsList, friendToken, event.key)}}></Button>
                          </View>
                        ):null}
                      </View>
                    );
                  })}
                </View>
              ):null}
            </ImageBackground>
          </BottomSheetView>
        </BottomSheet>

        {eventSelectionVisible == true ? (
          <View style={styles.footerSelection}>
            <TouchableOpacity style={styles.customSelection} onPress={() => {
              sheetRef.current.collapse();
              setEventSelectionVisible(false);
              setEventSelectionButtonVisible(false);
              setCreateEventData(false);
              setShowViewEventData(false);
              setShowAddFriendData(true);
            }}>
              <Image style={styles.selectionEmoji} source={require('../assets/emojis/addFriends.png')}></Image>
              <Text style = {styles.selectionText}>Add Friends</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.customSelection} onPress={() => {
              sheetRef.current.collapse();
              setEventSelectionVisible(false);
              setEventSelectionButtonVisible(false);
              setCreateEventData(true);
              setShowViewEventData(false);
              setShowAddFriendData(false);
            }}>
              <Image style={styles.selectionEmoji} source={require('../assets/emojis/createEvent.png')}></Image>
              <Text style = {styles.selectionText}>Create Event</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.customSelection} onPress={() => {
              sheetRef.current.collapse();
              setEventSelectionVisible(false);
              setEventSelectionButtonVisible(false);
              setCreateEventData(false);
              setShowViewEventData(true);
              setShowAddFriendData(false);
            }}>
              <Image style={styles.selectionEmoji} source={require('../assets/emojis/viewEvents.png')}></Image>
              <Text style = {styles.selectionText}>View Events</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.selectionButton} onPress={() => {setEventSelectionVisible(false)}}>
              <Image source={require('../assets/selectionIcons/cancelSelection.png')}></Image>
            </TouchableOpacity>
          </View>
        ):(
          <View style={styles.footerButton}>
            {eventSelectionButtonVisible == true ? (
              <TouchableOpacity onPress={() => {setEventSelectionVisible(true)}}>
                <Image source={require('../assets/selectionIcons/selectModal.png')}></Image>
              </TouchableOpacity> 
            ):null}            
          </View>
        )}       
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height,
    zIndex: -1,
  },
  footerButton: {
    position: 'absolute',
    zIndex: 10,
    bottom: 35,
    right: 25
  },
  footerSelection: {
    position: 'absolute',
    zIndex: 10,
    right: 25,
    bottom: 30,
    alignItems: 'flex-end'
  },
  backgroundImg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBackground: {
    height: '100%',
  },
  modalViewContainer:{
    marginLeft: 35,
  },
  selectionEmoji: {
    marginLeft: 13
  },
  selectionButton: {
    marginBottom: 5
  },
  customSelection: {
    marginBottom: 17,
    backgroundColor: 'white',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectionText: {
    fontFamily: 'TextBold',
    marginLeft: 11,
    paddingRight: 29,
    paddingTop: 10,
    paddingBottom: 9,
    color: '#454A4D',
    fontSize: 15,

  },
  createEventText: {
    fontFamily: 'TextBold',
    fontSize: 17,
    marginTop: 30
  },
  createEventInputs: {
    backgroundColor: '#D3D3D3',
    marginTop: 5,
    paddingLeft: 16,
    paddingRight: 10,
    borderRadius: 7,
    fontFamily: "TextBold",
    color: '#AFB9BF',
    backgroundColor: '#FFFFFF66',
    fontSize: 14
  },
  createEventName: {
    width: '45%'
  },
  createEventTime: {
    width: '18%'
  },
  createEventLocation: {
    width: '89%',
    paddingTop: 13,
    paddingBottom: 13
  },
  createEventContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  createEventButton: {
    flexDirection:'row',
    alignItems: 'center',
    backgroundColor: 'white',
    width: 158,
    borderRadius: 5,
    marginTop: 42,
    paddingTop: 2,
    paddingBottom: 2,
    marginLeft: '23%'
  },
  atText: {
    marginLeft: 17,
    marginRight: 17,
    bottom: 12
  },
  smallText: {
    marginTop: 18,
    fontFamily: 'TextLight',
    fontSize: 10,
    marginLeft: '16%'
  }
});