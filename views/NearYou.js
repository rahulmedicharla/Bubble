//react imports
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Button, Text, TextInput, TouchableOpacity, Share } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Formik } from "formik";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons'; 

//redux imports
import { acceptFriendRequest, addFriend, getFriendsLocation, getPendingFriendRequestData, resetMyPendingFriendRequest, resetPendingFriend } from '../redux/RTDatabseSlice';
import { useDispatch } from 'react-redux';
import { getDatabase, onValue, ref } from 'firebase/database';
import { addFriendToList, getFriendsList } from '../redux/firestoreSlice';

//Sharing imports
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

//https://github.com/react-native-maps/react-native-maps
//https://gorhom.github.io/react-native-bottom-sheet/modal/usage

export const NearYouPage = ({navigation, userToken, friendsLocation, friendToken, loadFriendsLocation,
  username, friendsList, pendingFriendToken, pendingFriendUsername, currentLoc}) => {

  const db = getDatabase();

  //react temp consts
  const map = useRef(null);

  //AddFriends Modal Consts
  const sheetRef = useRef(null);
  const snapPoints = ["50%"];

  const dispatch = useDispatch();

  const isValidRequest = () => {
    if(!friendsList.includes(pendingFriendUsername)){
      acceptFriendRequest(friendToken, pendingFriendToken, friendsList, username, pendingFriendUsername)
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
  
      EVENT LISTENERS FOR PENDING FRIEND
  
  */

  
  useEffect(() => {
    const friendsLocationData = ref(db, friendToken + '/friends/');
    return onValue(friendsLocationData, (snapshot) => {
      if(loadFriendsLocation){
        dispatch(getFriendsLocation(friendToken));
        dispatch(getFriendsList(userToken));
      }
    })
  }, [])

  useEffect(() => {
    const pendingFriendRequest = ref(db, friendToken + '/pendingFriendRequest/status');
    return onValue(pendingFriendRequest, (snapshot) => {
      if(snapshot.val() == 'fulfilled'){
        addFriend(pendingFriendToken, currentLoc, username, friendToken).then(() => {
          addFriendToList(userToken, pendingFriendUsername);
          resetMyPendingFriendRequest(friendToken);
          dispatch(resetPendingFriend());
        })
      }else if(snapshot.val() == 'needsAction'){
        getPendingFriendRequestData(friendToken).then((data) => {
          addFriend(data.friendToken, currentLoc, username, friendToken).then(() => {
            addFriendToList(userToken, data.username);
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
        latitudeDelta: .01,
        longitudeDelta: .01,
      }, 1000)
    }
  }, [currentLoc])


  return(
      <View style={styles.container}>
        <StatusBar></StatusBar>
        <MapView style={styles.map} showsUserLocation={true} ref={map} showsBuildings={true}>
          {friendsLocation.map(marker => {
            return (<Marker title={marker.name} key={marker.friendToken} coordinate={marker.latLng}></Marker>)
          })}
        </MapView>
        <BottomSheet ref={sheetRef} snapPoints={snapPoints} enablePanDownToClose index={-1} >
          <BottomSheetView>
            <Text>Friends</Text>
            {friendsList.map(friend => {
              return (<Text key={friend}>{friend}</Text>)
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