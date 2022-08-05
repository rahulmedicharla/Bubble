//react imports
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Button, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Formik } from "formik";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

//redux imports
import { addFriend, getFriendsLocation, getPendingFriendRequestData, resetMyPendingFriendRequest, resetPendingFriend, setPendingFriend, updateStatusToFulfilled, validateFriendToken } from '../redux/RTDatabseSlice';
import { useDispatch } from 'react-redux';
import { getDatabase, onValue, ref } from 'firebase/database';
import { addFriendToList, addToFriendsList } from '../redux/firestoreSlice';

//https://github.com/react-native-maps/react-native-maps
//https://gorhom.github.io/react-native-bottom-sheet/modal/usage

export const NearYouPage = ({navigation, userToken, friendsLocation, friendToken, isLive, 
  username, pendingFriendStatus, pendingFriendName, pendingFriendToken,  currentLoc}) => {

  const db = getDatabase();

  //react temp consts
  const map = useRef(null);

  //AddFriends Modal Consts
  const sheetRef = useRef(null);
  const snapPoints = ["15%", "40%"]

  const dispatch = useDispatch();

  const acceptFriendRequest = () => {
    updateStatusToFulfilled(friendToken, pendingFriendToken);
  } 

  /*
  
      EVENT LISTENERS FOR PENDING FRIEND
  
  */
  const pendingFriendRequest = ref(db, friendToken + '/pendingFriendRequest/status');
  onValue(pendingFriendRequest, (snapshot) => {
    switch(snapshot.val()){
      case 'pending':
          getPendingFriendRequestData(friendToken).then((data) => {
            dispatch(setPendingFriend({
              pendingFriendStatus: data.status,
              pendingFriendToken: data.friendToken,
              pendingFriendName: data.friendToken,
            }))
          })
        break;
      case 'needsAction':
          getPendingFriendRequestData(friendToken).then((data) => {
            dispatch(setPendingFriend({
              pendingFriendStatus: data.status,
              pendingFriendToken: data.friendToken,
              pendingFriendName: data.username,
            }))
          })
        break;
      case 'fulfilled':
        if(pendingFriendToken){
          addFriend(pendingFriendToken, currentLoc, username, friendToken).then(() => {
            addFriendToList(userToken, pendingFriendToken);
            resetMyPendingFriendRequest(friendToken);
            dispatch(resetPendingFriend());
            dispatch(getFriendsLocation(friendToken));
          })
        }
        break;
      default: 
        break;
    }
  })


  /**
   * USE EFFECTS
   */

  useEffect(() => {
    console.log(currentLoc.latitude);
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
            return (<Marker title={marker.name} key={marker.name} coordinate={marker.latLng}></Marker>)
          })}
        </MapView>
        <BottomSheet ref={sheetRef} snapPoints={snapPoints}>
          <BottomSheetView>
            <Formik initialValues={{oFriendToken: ''}} onSubmit={values => validateFriendToken(username, friendToken, values.oFriendToken)}>
            {({handleChange, handleSubmit, values}) => (
              <View>
                <Text>Add another users friendToken</Text>
                <TextInput placeholder="Friend Token" onChangeText={handleChange('oFriendToken')} value = {values.oFriendToken}></TextInput>
                <Button title = "Add User As Friend" onPress={handleSubmit}></Button>
              </View>
            )}
            </Formik>
            {pendingFriendStatus == 'needsAction' ? (
                <View>
                  <Text>Accept Friend Request from {pendingFriendName}</Text>
                  <Button title= "accept" onPress={acceptFriendRequest}></Button>
                </View>
            ):null}
            {pendingFriendStatus == 'pending' ? (
                <Text>Waiting for {pendingFriendToken} to accept</Text>
            ):null}
          </BottomSheetView>
        </BottomSheet>
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
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  }
});