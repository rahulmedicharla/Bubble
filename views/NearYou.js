//react imports
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {View, Button, Text, TextInput, TouchableOpacity, Share, Keyboard, Image, ImageBackground, TouchableWithoutFeedback, Dimensions } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Formik } from "formik";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import styles from './styling/NearYouStyling'
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

//redux imports
import { acceptFriendRequest, addFriend, createEvent, deleteEvent, getCurrentLocation, getEvents, getFriendsLocation, getFriendsRSVPEvents, 
  getPendingFriendRequestData, reccomendNewLocation, resetEventLocations, resetFriendEvents, resetMyPendingFriendRequest, resetPendingFriend, rsvpToAnothersEvent, setOnLoadZoomToLoc, updateLoc, updateVote, updateYourStatusInEvent } from '../redux/RTDatabseSlice';
import { useDispatch } from 'react-redux';
import { getDatabase, limitToLast, off, onValue, ref } from 'firebase/database';
import { addFriendToList, getFirestoreData, getFriendsList } from '../redux/firestoreSlice';

//Sharing imports
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { List } from 'react-native-paper';
import { ModalEventRight } from './subComponents/modalEventRight';
import PlacesInput from 'react-native-places-input';
import { mapsApiKey } from '../GoogleKeys'
import TimeInput from '@tighten/react-native-time-input';
import MapViewDirections from 'react-native-maps-directions';

//https://github.com/react-native-maps/react-native-maps
//https://gorhom.github.io/react-native-bottom-sheet/modal/usage

export const NearYouPage = ({navigation, userToken, friendsLocation, eventLocations, friendToken,
  username, friendsList, pendingFriendToken, pendingFriendUsername, pendingFriendColor, onLoadZoomToLoc, colorScheme, currentLoc}) => {

  const db = getDatabase();

  //view states
  const [eventSelectionVisible,setEventSelectionVisible] = useState(false); 

  const [showCreateEventData, setCreateEventData] = useState(false);
  const [showViewEventData, setShowViewEventData] = useState(false);
  const [showAddFriendData, setShowAddFriendData] = useState(false);

  const [tempPlace, setTempPlace] = useState(null);

  const [eventSelectionButtonVisible, setEventSelectionButtonVisible] = useState(true);

  const [directionsVisible, setDirectionsVisible] = useState(false);
  const [locDistance, setLocDistance] = useState(null);

  const [segmentedControl, setSegmentedControl] = useState(true);
  const [addFriendsIndex, setAddFriendsIndex] = useState(0);
  const [time, setTime] = useState('');


  //react temp consts
  const map = useRef(null);

  //AddFriends Modal Consts
  const sheetRef = useRef(null);
  const snapPoints = ["50%", "80%"];

  const dispatch = useDispatch();

  const isValidRequest = () => {
    if(friendsList.length == 5){
      alert('Already at max capacity with five friends');
      return;
    }
    const tokenArray = friendsList.map((friend) => {return friend.token})
    if(!tokenArray.includes(pendingFriendToken)){
      acceptFriendRequest(friendToken, pendingFriendToken, username, pendingFriendUsername, pendingFriendColor, colorScheme.marker)
  }else{
      alert('already friends with user');
      denyFriendRequest();
    }
  }

  const denyFriendRequest = () => {
    dispatch(resetPendingFriend());
  }

  const shareFriendToken = (friendToken, username, colorScheme) => {
    const link = Linking.createURL('pendingFriendRequest', {
      queryParams: {
        friendToken: friendToken,
        username: username,
        color: colorScheme.marker
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
            addFriendToList(userToken, data.username, data.friendToken, data.color, key).then(() => {
              resetMyPendingFriendRequest(friendToken);
              dispatch(getFirestoreData(userToken))
              dispatch(resetPendingFriend());
            });
          })
        })
      }else if(snapshot.val() == 'needsAction'){
        getPendingFriendRequestData(friendToken).then((data) => {
          addFriend(colorScheme, data.friendToken, currentLoc, username, friendToken).then((key) => {
            addFriendToList(userToken, data.username, data.friendToken, data.color, key).then(() => {
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
        if(friendsList != null && friendsList.length > 0){
          updateLoc(currentLoc, friendsList);
        }
      });
    }, 60000)

    return () => {
      clearTimeout(timer);
    }
  }, [currentLoc, friendsList, onLoadZoomToLoc])

  const animateToFriend = (friend) => {
    sheetRef.current.close();
    friendsLocation.map((marker) => {
      if(marker.friendToken == friend){
        map.current.animateToRegion({
          latitude: marker.latLng.latitude,
          longitude: marker.latLng.longitude,
          latitudeDelta: .008,
          longitudeDelta: .008,
        }, 1000)
      }
    })
  }

  const handleTimeChange = (time, validTime) => {
    if (!validTime) return;

    setTime(time);
  }

  const changeTempToPermanentEvent = (title, friendToken, friendsList, username, colorScheme) => {
    if(tempPlace && title.length > 0 && time.length > 0){
      sheetRef.current.close();
      const latLng = {
        latitude: tempPlace.result.geometry.location.lat,
        longitude: tempPlace.result.geometry.location.lng
      }
      getFriendsList(userToken).then((list) => {
        createEvent(title, tempPlace.result.name, time, latLng, friendToken, list, username, colorScheme).then(() => {
          setDirectionsVisible(false);
          setTempPlace(null);
          setTime('');
        });
      })
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
        setDirectionsVisible(false);
        setTempPlace(null);
      })
    }else{
      alert('Invalid Place')
    }
  }

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

            {/* DIRECTIONS */}
            {(tempPlace != null && locDistance != null) ? (
              <Marker title = "New Event" image={require('../assets/markerColors/eventMarker.png')} coordinate={{latitude: tempPlace.result.geometry.location.lat, longitude: tempPlace.result.geometry.location.lng}}>
                <Callout tooltip>
                  <View style={styles.pendingEventCallout}>
                    <Text style={styles.pendingEventCalloutText}>{Math.floor(locDistance)} min</Text>
                  </View>
                </Callout>
              </Marker>
            ):null}
            {directionsVisible ? (
              <MapViewDirections key={tempPlace.result.name} apikey={mapsApiKey} origin={currentLoc} strokeColor='#3B92F0' strokeWidth={5} destination={{latitude: tempPlace.result.geometry.location.lat, longitude: tempPlace.result.geometry.location.lng}} onReady={result => {
                setLocDistance(result.duration);
                
                map.current.animateToRegion({
                  latitude: tempPlace.result.geometry.location.lat-.004,
                  longitude: tempPlace.result.geometry.location.lng,
                  latitudeDelta: .01,
                  longitudeDelta: .01,
                }, 1000)
              }}></MapViewDirections>
            ):null}
          </MapView>
          <BottomSheet handleStyle={{backgroundColor: '#E8E4F4'}}  ref={sheetRef} snapPoints={snapPoints} enablePanDownToClose index={-1} onClose={() => {
            Keyboard.dismiss();
            setEventSelectionButtonVisible(true);
            setDirectionsVisible(false)
            setTempPlace(null);
          }}>
            <BottomSheetView>
              <ImageBackground style= {styles.modalBackground} source={require('../assets/background.png')}>
                {/* SHOW ADD FRIEND DATA */}
                {showAddFriendData == true ? (
                  <View style={styles.modalViewContainer}>
                    {addFriendsIndex == 0 ? (
                      <View>
                        <View style={styles.segmentedContainerFriends}>
                          <TouchableOpacity><Text style={[styles.addFriendsSegmentText, styles.highlightedText]}>My Friends</Text></TouchableOpacity>
                          <TouchableOpacity onPress={() => {setAddFriendsIndex(1)}}><Text style={styles.addFriendsSegmentText}>Add Friends</Text></TouchableOpacity>
                          <TouchableOpacity onPress={() => {setAddFriendsIndex(2)}}><Text style={styles.addFriendsSegmentText}>Set Bubble</Text></TouchableOpacity>
                        </View>
                        {friendsList.length == 0 ? (
                          <View style = {styles.noFriendsContainer}>
                            <Text style = {styles.infoText}>Looks like you don't have any friends yet</Text>
                            <TouchableOpacity style={styles.addFriendsNavButton} onPress={() => {setAddFriendsIndex(1)}}>
                              <Image style={styles.addFriendsEmoji} source={require('../assets/emojis/addFriends.png')}></Image>
                              <Text style= {styles.addFriendsNavText}>Add Friends</Text>
                            </TouchableOpacity>
                          </View>
                        ):null}
                        <View style={styles.friendsListContainer}>
                          {friendsList.map((friend) => {
                            return (
                              <TouchableOpacity key = {friend.token} onPress={() => {animateToFriend(friend.token)}}>
                                <View style = {styles.friendsList}>
                                  <Image source={parseInt(friend.color)}></Image>
                                  <Text style = {styles.friendText}>{friend.name}</Text>
                                </View>
                              </TouchableOpacity>
                            )
                          })}
                        </View>
                      </View>
                    ):null}
                    {addFriendsIndex == 1 ? (
                      <View>
                        <View style={styles.segmentedContainerFriends}>
                          <TouchableOpacity onPress={() => {setAddFriendsIndex(0)}}><Text style={[styles.addFriendsSegmentText]}>My Friends</Text></TouchableOpacity>
                          <TouchableOpacity><Text style={[styles.addFriendsSegmentText, styles.highlightedText]}>Add Friends</Text></TouchableOpacity>
                          <TouchableOpacity onPress={() => {setAddFriendsIndex(2)}}><Text style={styles.addFriendsSegmentText}>Set Bubble</Text></TouchableOpacity>
                        </View>
                        <View style={styles.addFriendsTextContainer}>
                          <Text style={styles.infoText}>You can have up to five friends in your bubble.</Text>
                          <Text style = {styles.infoText}>Choose wisely</Text>
                        </View>

                        {pendingFriendToken != null ? (
                          <View style = {styles.pendingRequest}>
                            <View style={styles.hLine}></View>
                            <View style=  {styles.pendingUser}>
                              <Image source = {parseInt(pendingFriendColor)}></Image>
                              <Text style = {styles.pendingUserText}>{pendingFriendUsername}</Text>
                              <View style={styles.pendingResultContainer}>
                                <Text style = {styles.pendingInfoText}>Accept</Text>
                                <TouchableOpacity style={styles.resultIcon} onPress={isValidRequest}><AntDesign name="checkcircle" size={20} color="white"></AntDesign></TouchableOpacity>
                                <TouchableOpacity style={styles.resultIcon} onPress={denyFriendRequest}><Feather name="x" size={24} color="black"></Feather></TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        ):null}

                        <View style = {styles.addFriendsLink}>
                          <View style={styles.hLine}></View>
                          <Text style = {styles.inviteFriendsTitle}>Invite Friends</Text>
                          <TouchableOpacity style={styles.shareLinkContainer} onPress={() => shareFriendToken(friendToken, username, colorScheme)}>
                            <Ionicons style={styles.shareLinkIcon} name="share-outline" size={20} color="black"></Ionicons>
                            <Text style = {styles.shareLinkText}>Share</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ):null}
                    {addFriendsIndex == 2 ? (
                      <View>
                        <View style={styles.segmentedContainerFriends}>
                          <TouchableOpacity onPress={() => {setAddFriendsIndex(0)}}><Text style={[styles.addFriendsSegmentText]}>My Friends</Text></TouchableOpacity>
                          <TouchableOpacity onPress={() => {setAddFriendsIndex(1)}}><Text style={styles.addFriendsSegmentText}>Add Friends</Text></TouchableOpacity>
                          <TouchableOpacity><Text style={[styles.addFriendsSegmentText, styles.highlightedText]}>Set Bubble</Text></TouchableOpacity>
                        </View>
                      </View>
                    ):null}
                  </View>
                ):null}

                {/* SHOW CREATE EVENT DATA */}
                {showCreateEventData == true ? (
                  <Formik initialValues={{title: ''}} onSubmit={(values) => {changeTempToPermanentEvent(values.title.trim(), friendToken, friendsList, username, colorScheme)}}>
                  {({handleChange, handleSubmit, values}) => (
                    <View style = {styles.modalViewContainer}>
                      <Text style = {styles.createEventText}>Create Event</Text>

                      <View style={styles.createEventContainer}>
                        <TextInput style={[styles.createEventInputs, styles.createEventName]} placeholderTextColor='#AFB9BF' placeholder="Name the event" onChangeText={handleChange('title')} value = {values.title}></TextInput>
                        <Text style = {[styles.createEventText, styles.atText]}>at</Text>

                        <TimeInput errorText={null} styles={{componentContainer: {top: 12},input: {width: 86, right: 3}, toggle: {right: 50}}} onTimeChange={handleTimeChange} theme={styles.timeInput}></TimeInput>

                      </View>

                      <View>
                        <PlacesInput stylesInput={styles.placesInputBox} requiredCharactersBeforeSearch={5} stylesContainer={styles.placesInputContainer} googleApiKey={mapsApiKey} onSelect={(place) => {setTempPlace(place); setDirectionsVisible(true)}} placeHolder={"Suggest a Location"} searchRadius={500} searchLatitude={parseFloat(currentLoc.latitude)} searchLongitude={parseFloat(currentLoc.longitude)} queryTypes="establishment" ></PlacesInput>
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
                                            <PlacesInput stylesInput={styles.addRecInput} requiredCharactersBeforeSearch={5} stylesContainer={styles.addRecContainer} googleApiKey={mapsApiKey} onSelect={(place) => {setTempPlace(place); setDirectionsVisible(true)}} placeHolder={"Enter a recommendation..."} searchRadius={500} searchLatitude={parseFloat(currentLoc.latitude)} searchLongitude={parseFloat(currentLoc.longitude)} queryTypes="establishment" ></PlacesInput>
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
                <Text style = {styles.selectionText}>My Bubble</Text>
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