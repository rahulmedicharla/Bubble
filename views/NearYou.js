//react imports
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Button, Text, TextInput, TouchableOpacity, Share, Keyboard, Image, ImageBackground, TouchableWithoutFeedback } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Formik } from "formik";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

//redux imports
import { acceptFriendRequest, addFriend, createEvent, deleteEvent, getCurrentLocation, getEvents, getFriendsLocation, getFriendsRSVPEvents, 
  getPendingFriendRequestData, reccomendNewLocation, resetEventLocations, resetFriendEvents, resetMyPendingFriendRequest, resetPendingFriend, rsvpToAnothersEvent, setOnLoadZoomToLoc, updateLoc, updateVote, updateYourStatusInEvent } from '../redux/RTDatabseSlice';
import { useDispatch } from 'react-redux';
import { getDatabase, off, onValue, ref, update } from 'firebase/database';
import { addFriendToList, getFirestoreData } from '../redux/firestoreSlice';

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
  username, friendsList, pendingFriendToken, pendingFriendUsername, onLoadZoomToLoc, colorScheme, currentLoc}) => {

  const db = getDatabase();

  //view states
  const [eventSelectionVisible,setEventSelectionVisible] = useState(false); 

  const [showCreateEventData, setCreateEventData] = useState(false);
  const [showViewEventData, setShowViewEventData] = useState(false);
  const [showAddFriendData, setShowAddFriendData] = useState(false);

  const [tempPlace, setTempPlace] = useState(null);

  const [eventSelectionButtonVisible, setEventSelectionButtonVisible] = useState(true);

  const [segmentedControl, setSegmentedControl] = useState(true);


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
          addFriend(colorScheme, data.friendToken, currentLoc, username, friendToken).then((key) => {
            addFriendToList(userToken, data.username, data.friendToken, key).then(() => {
              resetMyPendingFriendRequest(friendToken);
              dispatch(getFirestoreData(userToken))
              dispatch(resetPendingFriend());
            });
          })
        })
      }else if(snapshot.val() == 'needsAction'){
        getPendingFriendRequestData(friendToken).then((data) => {
          addFriend(colorScheme, data.friendToken, currentLoc, username, friendToken).then((key) => {
            addFriendToList(userToken, data.username, data.friendToken, key).then(() => {
              resetMyPendingFriendRequest(friendToken);
              dispatch(getFirestoreData(userToken))
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
    const timer = setTimeout(() => {
      dispatch(getCurrentLocation()).then(() => {
        console.log('updating');
        if(friendsList != null && friendsList.length > 0){
          updateLoc(currentLoc, friendsList);
          console.log('updatingLoc');
        }
      });
    }, 60000)

    return () => {
      clearTimeout(timer);
    }
  }, [currentLoc, friendsList, onLoadZoomToLoc])

  const changeTempToPermanentEvent = (title, time, friendToken, friendsList, username, colorScheme) => {
    if(tempPlace && title.length > 0 && time.length > 0){
      sheetRef.current.close();
      const latLng = {
        latitude: tempPlace.result.geometry.location.lat,
        longitude: tempPlace.result.geometry.location.lng
      }
      createEvent(title, tempPlace.result.name, time, latLng, friendToken, friendsList, username, colorScheme).then(() => {
        setTempPlace(null);
      });
    }else{
      alert('Invalid Event')
    }
  }

  const addNewLoc = (creator, key, token, pendingResponses) => {
    if(tempPlace){
      const latLng = {
        latitude: tempPlace.result.geometry.location.lat,
        longitude: tempPlace.result.geometry.location.lng
      }
      const location = tempPlace.result.name;
      reccomendNewLocation(creator, key, token, pendingResponses, location, latLng).then(() => {
        setTempPlace(null);
      })
    }else{
      alert('Invalid Place')
    }
  }

  

  /*

  CHECK WNY MARKERS ARE DIFFERENT SIZES
  CHECK WHY VIEW EVENT DATA INDENTED
  */
  return(
      <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
          <View style={styles.container}>
          <StatusBar></StatusBar>
          <MapView style={styles.map} ref={map}>
            {/* YOUR MARKER */}
            <Marker title = {'You'} key={'You'} image={colorScheme.marker} coordinate={currentLoc}>
              <Callout tooltip>
                <View style = {[{backgroundColor: colorScheme.backgroundColor}, styles.markerCallout]}>
                  <Text style={[{color: colorScheme.textColor}, styles.markerText]}>You</Text>
                </View>
              </Callout>
            </Marker>

            {friendsLocation.map(marker => {
              return (<Marker title={marker.name} image={marker.colorScheme.marker}  key={marker.friendToken} coordinate={marker.latLng}>
                <Callout tooltip>
                  <View style={[{backgroundColor: marker.colorScheme.backgroundColor}, styles.markerCallout]}>
                    <Text style={[{color: marker.colorScheme.textColor}, styles.markerText]}>{marker.name}</Text>
                  </View>
                </Callout>
              </Marker>)
            })}

            {eventLocations.map(marker => {
              return marker.origin.location.map((loc) => {
                return (<Marker title={loc.title} centerOffset={{x: 0, y:-10 }} image={require('../assets/markerColors/eventMarker.png')} key={loc.title} coordinate={loc.latLng}>
                <Callout tooltip>
                  <View style={styles.eventMarker}>
                    <Text style={styles.eventText}>{loc.title}</Text>
                  </View>
                </Callout>
              </Marker>)
              })
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
                  </View>
                ):null}

                {/* SHOW CREATE EVENT DATA */}
                {showCreateEventData == true ? (
                  <Formik initialValues={{title: '', time: ''}} onSubmit={(values) => {changeTempToPermanentEvent(values.title.trim(), values.time.trim(), friendToken, friendsList, username, colorScheme)}}>
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
                  <View style={styles.modalViewContainer}>
                    <Text style = {styles.createEventText}>View Events</Text>
                    <List.AccordionGroup>
                      {eventLocations.map((event) => {
                        return (
                          <List.Accordion right={(props) => <ModalEventRight props = {props.isExpanded}></ModalEventRight>} titleStyle={styles.eventTitleStyle} theme={{colors: {background: 'transparent', primary: 'black'} }}  key={event.origin.key} id={event.origin.key} title = {event.origin.title + ' at ' + event.origin.time}>
                            {segmentedControl ? (
                              <View style={styles.viewEventContainer}>
                                <View style={styles.segmentedContainer}>
                                  <TouchableOpacity><Text style={[styles.segmentedText, styles.highlightedText]}>Who</Text></TouchableOpacity>
                                  <TouchableOpacity onPress={() => {setSegmentedControl(false)}}><Text style={styles.segmentedText}>Where</Text></TouchableOpacity>
                                </View>

                                <View style={styles.pendingReponseUser}>
                                  <Image source={event.origin.creator.colorScheme.marker} style={styles.pendingResponseIcon}></Image>
                                  <Image source = {require('../assets/status/statusChangedAccepted.png')} style={styles.statusIcons}></Image>
                                  {event.origin.creator.token == friendToken ? (
                                    <Text style={styles.pendingResponseUserName}>You</Text>
                                  ):(
                                    <Text style={styles.pendingResponseUserName}>{event.origin.creator.name}</Text>
                                  )}
                                  <Text style={styles.pendingResponseUserMetadata}>Creator</Text>
                                </View>

                                {event.origin.pendingResponses.map((response) => {
                                  if(response.status != 'Unanswered'){
                                    return(
                                      <View style={styles.pendingReponseUser} key={response.token}>
                                        <Image source={response.colorScheme.marker} style={styles.pendingResponseIcon}></Image>
                                        {response.status == 'Attending' ? (
                                          <Image source = {require('../assets/status/statusChangedAccepted.png')} style={styles.statusIcons}></Image>
                                        ):(
                                          <Image source = {require('../assets/status/statusChangedMaybe.png')} style={styles.statusIcons}></Image>
                                        )}
                                        <Text style={styles.pendingResponseUserName}>{response.name}</Text>
                                        {response.friendOf != null ? (
                                          <Text style={styles.pendingResponseUserMetadata}>{response.friendOf}'s Friend</Text>
                                        ):(
                                          <Text style={styles.pendingResponseUserMetadata}>{event.origin.creator.name}'s Friend</Text>
                                        )}
                                      </View>
                                    );
                                  }
                                })}

                                {event.origin.pendingResponses.map((response) => {
                                  if(response.token == friendToken && friendToken != event.origin.creator.token && response.status == 'Unanswered'){
                                    return(
                                      <View key={response.token} style={styles.statusChangeContainer}>
                                        <TouchableOpacity style={styles.statusAcceptedButton} onPress={() => {updateYourStatusInEvent(event.origin.pendingResponses, event.origin.creator.token, event.origin.key, friendToken, username, 'Attending')}}>
                                          <Image style={styles.statusAcceptedLogo} source={require('../assets/status/statusChangedAccepted.png')}></Image>
                                          <Text style={[styles.pendingResponseUserName, styles.statusAcceptedText]}>Down to join</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.statusAcceptedButton} onPress={() => {updateYourStatusInEvent(event.origin.pendingResponses, event.origin.creator.token, event.origin.key, friendToken, username, 'Not Attending')}}>
                                          <Image style = {styles.statusAcceptedLogo} source={require('../assets/status/statusChangedMaybe.png')}></Image>
                                          <Text style={[styles.pendingResponseUserName, styles.statusAcceptedText]}>Maybeeee</Text>
                                        </TouchableOpacity>
                                      </View>
                                    )
                                  }
                                })}
                                {event.origin.creator.token == friendToken ? (
                                  <View>
                                    <Button title = "Delete Event" onPress={() => {deleteEvent(friendToken, event.origin.key)}}></Button>
                                  </View>
                                ):null}
                              </View>
                            ):(
                              <View style={styles.viewEventContainer}>
                                <View style={styles.segmentedContainer}>
                                  <TouchableOpacity onPress={() => {setSegmentedControl(true)}}><Text style={styles.segmentedText}>Who</Text></TouchableOpacity>
                                  <TouchableOpacity><Text style={[styles.segmentedText, styles.highlightedText]}>Where</Text></TouchableOpacity>
                                </View>
                                {event.origin.pendingResponses.map((response) => {
                                  if(response.token == friendToken){
                                    if(response.status == 'Attending'){
                                      if(!event.origin.voteList.includes(friendToken)){
                                        return (
                                          <View key = {response.token}>
                                            <PlacesInput stylesInput={styles.addRecInput} requiredCharactersBeforeSearch={5} stylesContainer={styles.addRecContainer} googleApiKey={mapsApiKey} onSelect={(place) => {setTempPlace(place)}} placeHolder={"Enter a recommendation..."} searchRadius={500} searchLatitude={parseFloat(currentLoc.latitude)} searchLongitude={parseFloat(currentLoc.longitude)} queryTypes="establishment" ></PlacesInput>
                                            <TouchableOpacity style={styles.addRecButton} onPress={() => {addNewLoc(event.origin.creator.token, event.origin.key, friendToken, event.origin.pendingResponses)}}>
                                              <Text style={styles.addRecText}>Recommend</Text>
                                            </TouchableOpacity>
                                            {event.origin.location.map((loc) => {
                                              return (
                                                <View style={styles.eventLocationContainer} key = {loc.title}>
                                                  <View style={styles.horizontalOrg}>
                                                    <TouchableOpacity onPress={() => {updateVote(event.origin.creator.token, event.origin.key, loc.title, friendToken, event.origin.pendingResponses)}}>
                                                      <MaterialCommunityIcons name="selection-ellipse-arrow-inside" size={20} color="black"></MaterialCommunityIcons>
                                                    </TouchableOpacity>
                                                    <Text style={styles.eventLocationText}>{loc.title}</Text>
                                                  </View>
                                                  <View style = {styles.horizontalOrg}>
                                                    <Image style={{width: (((loc.vote/event.origin.totalVotes).toFixed(2) * 100) -20)+ '%'}} source={require('../assets/votingProgress.png')}></Image>
                                                    <Text style = {styles.eventLocationCount}>{loc.vote} vote(s)</Text>
                                                  </View>
                                                </View>
                                              );
                                            })}
                                          </View>
                                        );
                                      }else{
                                        return event.origin.location.map((loc) => {
                                          return (
                                            <View style={styles.eventLocationContainer} key = {loc.title}>
                                              <Text style={styles.eventLocationText}>{loc.title}</Text>
                                              <View style = {styles.horizontalOrg}>
                                                <Image style={{width: (((loc.vote/event.origin.totalVotes).toFixed(2) * 100) -20) + '%'}} source={require('../assets/votingProgress.png')}></Image>
                                                <Text style = {styles.eventLocationCount}>{loc.vote} vote(s)</Text>
                                              </View>
                                            </View>
                                          );
                                        })
                                      }
                                    }else{
                                      return event.origin.location.map((loc) => {
                                        return (
                                          <View style={styles.eventLocationContainer} key = {loc.title}>
                                            <Text style={styles.eventLocationText}>{loc.title}</Text>
                                            <View style = {styles.horizontalOrg}>
                                              <Image style={{width: (((loc.vote/event.origin.totalVotes).toFixed(2) * 100) -20) + '%'}} source={require('../assets/votingProgress.png')}></Image>
                                              <Text style = {styles.eventLocationCount}>{loc.vote} vote(s)</Text>
                                            </View>
                                          </View>
                                        );
                                      })

                                    }
                                  }
                                })}
                              </View>
                            )}
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
  },
  viewEventContainer: {
    marginLeft: 16
  },
  markerCallout: {
    borderRadius: 5,
    boxShadow: "rgba(69, 81, 88, 0.1)"
  },
  markerText: {
    fontFamily: 'TextBold',
    fontSize: 17, 
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 10,
    paddingRight: 11
  },
  eventMarker:{
    borderRadius: 5,
    boxShadow: "rgba(69, 81, 88, 0.1)",
    backgroundColor: '#F8D7D5',
    flexDirection: 'row'
  },
  eventText: {
    fontFamily: 'TextBold',
    fontSize: 17, 
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 10,
    paddingRight: 11,
    color: '#CD534C'
  },
  pendingReponseUser: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  pendingResponseIcon: {
    width: 23,
    height: 23
  },
  statusIcons: {
    position:'relative',
    right: 13,
    top: 4
  },
  pendingResponseUserName: {
    fontFamily: 'TextBold',
    color: '#434343',
    position: 'relative',
    right: 5,
    fontSize: 15
  },
  pendingResponseUserMetadata: {
    fontFamily: 'TextLight',
    color: '#AFAFAF',
    marginLeft: 3
  },
  statusChangeContainer: {
    marginTop: 30,
    flexDirection: 'row',
    width:'100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusAcceptedButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderRadius: 5,
    marginRight: 10,
  },
  statusAcceptedLogo: {
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  statusAcceptedText: {
    marginLeft: 10,
    marginRight: 15
  },
  segmentedContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10
  },
  segmentedText: {
    color: '#6D7377',
    fontFamily: 'TextBold',
    marginRight: 30,
  },
  highlightedText: {
    textDecorationLine: 'underline'
  },
  eventLocationContainer:{
    marginTop: 4,
    marginBottom: 10
  },
  eventLocationText: {
    fontFamily: 'TextBold',
    color: '#434343',
    fontSize: 15,
    marginLeft: 6
  },
  eventLocationCount:{
    fontFamily: 'TextLight',
    marginLeft: 10,
    fontSize: 12
  },
  horizontalOrg: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addRecContainer: {
    position: 'relative',
    width: '89%',
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginBottom: 20
  },
  addRecInput: {
    fontSize: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF85",
    fontFamily: "TextBold",
    color: '#AFB9BF',
    right: 8
  },
  addRecButton: {
    width: '89%',
    marginBottom: 20,
    alignItems: 'flex-end'
  },
  addRecText:{
    fontFamily: 'TextBold'
  }
});