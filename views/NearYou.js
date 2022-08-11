//react imports
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Button, Text, TextInput, TouchableOpacity, Share } from 'react-native';
import MapView, { Callout, CalloutSubview, Marker } from 'react-native-maps';
import { Formik } from "formik";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons';

//redux imports
import { acceptFriendRequest, addFriend, createEvent, deleteEvent, getEvents, getFriendsLocation, getPendingFriendRequestData, resetEventLocations, resetMyPendingFriendRequest, resetPendingFriend, resetTempEvent, setLoadEvents, setTempEvent, updateYourStatusInEvent } from '../redux/RTDatabseSlice';
import { useDispatch } from 'react-redux';
import { getDatabase, onValue, ref } from 'firebase/database';
import { addFriendToList, getFriendsList } from '../redux/firestoreSlice';

//Sharing imports
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

//https://github.com/react-native-maps/react-native-maps
//https://gorhom.github.io/react-native-bottom-sheet/modal/usage

export const NearYouPage = ({navigation, userToken, friendsLocation, tempEvent, loadEvents, eventLocations, friendToken,
  username, friendsList, pendingFriendToken, pendingFriendUsername, currentLoc}) => {

  const db = getDatabase();

  //react temp consts
  const map = useRef(null);
  const tempEventRef = useRef(null);

  //AddFriends Modal Consts
  const sheetRef = useRef(null);
  const snapPoints = ["50%"];

  const dispatch = useDispatch();

  const isValidRequest = () => {
    const tokenArray = friendsList.map((friend) => {return friend.token})
    if(!tokenArray.includes(pendingFriendToken)){
      acceptFriendRequest(friendToken, pendingFriendToken, username)
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

  /*
  
      EVENT LISTENERS FOR EVENTS WITH FRIENDS
  
  */

  useEffect(() => {
    const eventsData = ref(db, friendToken + '/pendingEvent/');
    return onValue(eventsData, (snapshot) => {
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
  }, [loadEvents])

  /*
  
      EVENT LISTENERS FOR FRIENDS LOCATION
  
  */
  
  
  useEffect(() => {
    const friendsLocationData = ref(db, friendToken + '/friends/');
    return onValue(friendsLocationData, (snapshot) => {
      dispatch(getFriendsLocation(friendToken));
      dispatch(getFriendsList(userToken));
    })
  }, [])

  /*
  
      EVENT LISTENERS FOR PENDING FRIEND
  
  */

  useEffect(() => {
    const pendingFriendRequest = ref(db, friendToken + '/pendingFriendRequest/status');
    return onValue(pendingFriendRequest, (snapshot) => {
      if(snapshot.val() == 'fulfilled'){
        addFriend(pendingFriendToken, currentLoc, username, friendToken).then(() => {
          addFriendToList(userToken, pendingFriendUsername, pendingFriendToken);
          resetMyPendingFriendRequest(friendToken);
          dispatch(resetPendingFriend());
        })
      }else if(snapshot.val() == 'needsAction'){
        getPendingFriendRequestData(friendToken).then((data) => {
          addFriend(data.friendToken, currentLoc, username, friendToken).then(() => {
            addFriendToList(userToken, data.username, data.friendToken);
            resetMyPendingFriendRequest(friendToken);
            dispatch(resetPendingFriend());
          })
        })
      }
    })
  }, [username])

  /**
   * USE EFFECTS
   */

  useEffect(() => {
    if(currentLoc){
      map.current.animateToRegion({
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        latitudeDelta: .008,
        longitudeDelta: .008,
      }, 1000)
    }
  }, [currentLoc])

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
        <BottomSheet ref={sheetRef} snapPoints={snapPoints} enablePanDownToClose index={-1} >
          <BottomSheetView>
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
            {tempEvent != null ? (
              <Formik initialValues={{title: '', location: '', time: ''}} onSubmit={(values) => {changeTempToPermanentEvent(values.title, values.location, values.time, tempEvent.latLng, friendToken, friendsList, username)}}>
                {({handleChange, handleSubmit, values}) => (
                  <View>
                    <Text>Please enter name of event</Text>
                    <TextInput placeholder="Ex. Dinner" onChangeText={handleChange('title')} value = {values.title}></TextInput>
                    <Text>Please enter location of event</Text>
                    <TextInput placeholder="Ex. Chipotle" onChangeText={handleChange('location')} value = {values.location}></TextInput>
                    <Text>Please enter time</Text>
                    <TextInput placeholder="Ex. 7:30" onChangeText={handleChange('time')} value = {values.time}></TextInput>
                    <Button title = "Create event" onPress={handleSubmit}></Button>
                </View>
                )}
              </Formik>
          ):null}
          {eventLocations.map((event) => {
            return (
              <View key={event.creator.token}>
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
          </BottomSheetView>
        </BottomSheet>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={() => {sheetRef.current.expand()}}>
            <Ionicons name="md-menu" size={40} color="black"></Ionicons>
          </TouchableOpacity>             
        </View>
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
    bottom: 30,
    right: 25
  }
});