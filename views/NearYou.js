//react imports
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Button, Text, TextInput, TouchableOpacity, Share, Keyboard, Image, ImageBackground, ScrollView, TouchableWithoutFeedback } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Formik } from "formik";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons';

//redux imports
import { acceptFriendRequest, addFriend, createEvent, deleteEvent, getCurrentLocation, getEvents, getFriendsLocation, getFriendsRSVPEvents, getPendingFriendRequestData, resetEventLocations, resetFriendEvents, resetMyPendingFriendRequest, resetPendingFriend, rsvpToAnothersEvent, setLoadEvents, setOnLoadZoomToLoc, updateLoc, updateYourStatusInEvent } from '../redux/RTDatabseSlice';
import { useDispatch } from 'react-redux';
import { getDatabase, off, onValue, ref, update } from 'firebase/database';
import { addFriendToList, getFriendsList } from '../redux/firestoreSlice';

//Sharing imports
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { List } from 'react-native-paper';
import { ModalEventRight } from './subComponents/modalEventRight';
import PlacesInput from 'react-native-places-input';
import { mapsApiKey } from '../GoogleKeys'

//https://github.com/react-native-maps/react-native-maps
//https://gorhom.github.io/react-native-bottom-sheet/modal/usage

export const NearYouPage = ({navigation, userToken, friendsLocation, eventLocations, friendsEvents, friendToken,
  username, friendsList, updateList, pendingFriendToken, pendingFriendUsername, onLoadZoomToLoc, currentLoc}) => {

  const db = getDatabase();

  //view states
  const [eventSelectionVisible,setEventSelectionVisible] = useState(false); 

  const [showCreateEventData, setCreateEventData] = useState(false);
  const [showViewEventData, setShowViewEventData] = useState(false);
  const [showAddFriendData, setShowAddFriendData] = useState(false);

  const [tempPlace, setTempPlace] = useState(null);

  const [eventSelectionButtonVisible, setEventSelectionButtonVisible] = useState(true);

  //react temp consts
  const map = useRef(null);

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

    // SEEING FRIENDS EVENTS
    const friendsEventData = ref(db, friendToken + '/friendsPendingEvent/');
    onValue(friendsEventData, (snapshot) => {
      dispatch(resetFriendEvents());
      if(snapshot.exists()){
        snapshot.forEach((child) => {
          dispatch(getFriendsRSVPEvents({
            path: child.val().path,
            name: child.val().name,
            token: child.key
          }))
        })
      }
    })

    // EVENTS WITH FRIENDS

    const eventsData = ref(db, friendToken + '/pendingEvent/');
    onValue(eventsData, (snapshot) => {
      dispatch(resetEventLocations())
      if(snapshot.exists()){
        snapshot.forEach((child) => {
          dispatch(getEvents({
            key: child.key,
            val: child.val().friendToken,
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

      off(friendsEventData);
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
    if(updateList != null && updateList.length > 0){
      const timer = setTimeout(() => {
        dispatch(getCurrentLocation()).then(() => {
          console.log('updating');
          updateLoc(currentLoc, updateList);
        });
      }, 60000)
  
      return () => {
        clearTimeout(timer);
      }
    }
  }, [currentLoc, updateList, onLoadZoomToLoc])

  const changeTempToPermanentEvent = (title, time, friendToken, friendsList, username) => {
    if(tempPlace && title.length > 0 && time.length > 0){
      sheetRef.current.close();
      const latLng = {
        latitude: tempPlace.result.geometry.location.lat,
        longitude: tempPlace.result.geometry.location.lng
      }
      createEvent(title, tempPlace.result.name, time, latLng, friendToken, friendsList, username)
    }else{
      alert('Invalid Event')
    }
  }

  return(
      <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
          <View style={styles.container}>
          <StatusBar></StatusBar>
          <MapView style={styles.map} showsUserLocation ref={map}>
            {friendsLocation.map(marker => {
              return (<Marker title={marker.name} key={marker.friendToken} coordinate={marker.latLng}></Marker>)
            })}
            {eventLocations.map(marker => {
              return (<Marker title={marker.origin.title} key={marker.origin.title} coordinate={marker.origin.latLng}>
                <Callout>
                  <Text>{marker.origin.title} @ {marker.origin.time} @ {marker.origin.location}</Text>
                  <Text>Created by {marker.origin.creator.name}</Text>
                </Callout>
              </Marker>)
            })}
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
                    <Text>Friends Events</Text>
                    {friendsEvents.map((friend) => {
                      return(
                        <View key={friend.origin.key}>
                          <Text>{friend.name} is attending {friend.origin.title} at {friend.origin.time}</Text>
                          <Text>{friend.name} is attending with {friend.origin.creator.name}</Text>
                          <Button title = "attend" onPress={() => {rsvpToAnothersEvent(friend.origin.creator.token, friend.origin.key, username, friendToken, friend.origin.pendingResponses, friend.name, friend.token, friendsList)}}></Button>
                          <Button title = 'dont attend'></Button>
                        </View>  
                      );
                    })}
                  </View>
                ):null}

                {/* SHOW CREATE EVENT DATA */}
                {showCreateEventData == true ? (
                  <Formik initialValues={{title: '', time: ''}} onSubmit={(values) => {changeTempToPermanentEvent(values.title.trim(), values.time.trim(), friendToken, friendsList, username)}}>
                  {({handleChange, handleSubmit, values}) => (
                    <View style = {styles.modalViewContainer}>
                      <Text style = {styles.createEventText}>Create Event</Text>

                      <View style={styles.createEventContainer}>
                        <TextInput style={[styles.createEventInputs, styles.createEventName]} placeholderTextColor='#AFB9BF' placeholder="Name the event" onChangeText={handleChange('title')} value = {values.title}></TextInput>
                        <Text style = {[styles.createEventText, styles.atText]}>at</Text>
                        <TextInput style={[styles.createEventInputs, styles.createEventTime]} placeholderTextColor='#AFB9BF' keyboardType={'number-pad'} placeholder="0:00" onChangeText={handleChange('time')} value = {values.time}></TextInput>
                      </View>

                      <View>
                        <PlacesInput stylesInput={styles.placesInputBox} requiredCharactersBeforeSearch={5} stylesContainer={styles.placesInputContainer} googleApiKey={mapsApiKey} onSelect={(place) => {setTempPlace(place)}} placeHolder={"Suggest a Location"} searchRadius={500} searchLatitude={parseFloat(currentLoc.latitude)} searchLongitude={parseFloat(currentLoc.longitude)} queryTypes="establishment" ></PlacesInput>
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
                    <List.AccordionGroup>
                      {eventLocations.map((event) => {
                        return (
                          <List.Accordion right={(props) => <ModalEventRight props = {props.isExpanded}></ModalEventRight>} titleStyle={styles.eventTitleStyle} theme={{colors: {background: 'transparent', primary: 'black'} }}  key={event.origin.key} id={event.origin.key} title = {event.origin.title + ' at ' + event.origin.time}>
                            <View styles={styles.viewEventContainer}>
                              <Text>Created by {event.origin.creator.name}</Text>
                              {event.origin.pendingResponses.map((response) => {
                                if(response.token == friendToken && response.status == 'Unanswered' ){
                                  return (
                                  <View key = {response.token}>
                                    <Text>You are {response.status}</Text>
                                    <Button title = "Attend" onPress={() => {updateYourStatusInEvent(event.origin.pendingResponses, event.origin.creator.token, event.origin.key, friendToken, friendsList, username, 'Attending')}}></Button>
                                    <Button title = "Dont Attend" onPress={() => {updateYourStatusInEvent(event.origin.pendingResponses, event.origin.creator.token, event.origin.key, friendToken, friendsList, username, 'Not Attending')}}></Button>
                                  </View>);
                                }else{
                                  if(response.friendOf != null){
                                    return (<Text key = {response.token}>{response.token} +  {response.name} is {response.status} and is friend of {response.friendOf}</Text>)
                                  }else{
                                    return (<Text key = {response.token}>{response.token} +  {response.name} is {response.status}</Text>)
                                  }
                                }
                              })}
                              {event.origin.creator.token == friendToken ? (
                                <View>
                                  <Button title = "Delete Event" onPress={() => {deleteEvent(event.origin.deletePaths, friendToken, event.origin.key)}}></Button>
                                </View>
                              ):null}
                            </View>
                          </List.Accordion>
                        );
                      })}
                    </List.AccordionGroup>
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
      </TouchableWithoutFeedback>
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
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0, .4)', 
    shadowOffset: { height: 1, width: 1 }, 
    shadowOpacity: 1, 
    shadowRadius: 1, 
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
  createEventContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  placesInputContainer: {
    position: 'relative',
    marginTop: 16,
    width: '89%',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  placesInputBox: {
    paddingTop: 13,
    paddingBottom: 13,
    paddingLeft: 16,
    paddingRight: 10,
    fontSize: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF85",
    fontFamily: "TextBold",
    color: '#AFB9BF',
    right: 8
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
    marginLeft: 15,
    marginRight: 15,
    bottom: 12
  },
  smallText: {
    marginTop: 18,
    fontFamily: 'TextLight',
    fontSize: 10,
    marginLeft: '16%'
  },
  eventTitleStyle: {
    fontFamily: 'TextBold',
    fontSize: 18,
    marginLeft: 34
  },
  viewEventContainer: {
    marginLeft: 50
  }
});