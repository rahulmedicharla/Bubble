//react imports
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Dimensions, Button, Text, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Formik } from "formik";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

//firebase imports
import { getAuth } from 'firebase/auth';
import { child, get, getDatabase, ref } from 'firebase/database';

//redux imports
import { activatePendingFriendRequest, addUsersAsFriends, resetPendingFriendRequest, selectCurrentLocation, selectFriendsLocation, selectFriendToken, selectIsLive, selectPendingFriend, selectPendingFriendStatus, selectPendingFriendToken, updateStatusToFulfilled } from '../redux/RTDatabseSlice';
import { setFriendsLocation, setCurrentLocation, setPendingFriendToken, setPendingStatus, setPendingFriend } from '../redux/RTDatabseSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectUsername } from '../redux/firestoreSlice';

//https://github.com/react-native-maps/react-native-maps
//https://gorhom.github.io/react-native-bottom-sheet/modal/usage

export const renderNearYou = () => {
  //firebase consts
  const auth = getAuth();
  const database = getDatabase();

  //react temp consts
  const [region, setRegion] = useState(null);
  const map = useRef(null);

  //AddFriends Modal Consts
  const sheetRef = useRef(null);
  const snapPoints = ["15%", "40%"]

  //redux variables
  //RTDB stores
  const friendsLocation = useSelector(selectFriendsLocation);
  const friendToken = useSelector(selectFriendToken);
  const isLive = useSelector(selectIsLive);
  const currentLoc = useSelector(selectCurrentLocation);
  const pendingFriend = useSelector(selectPendingFriend);
  const pendingFriendToken = useSelector(selectPendingFriendToken);
  const pendingFriendStatus = useSelector(selectPendingFriendStatus);
  
  //firestore stores
  const username = useSelector(selectUsername);

  const dispatch = useDispatch();

  const acceptFriendRequest = () => {
    const data = {
      pendingFriendStatus: 'fulfilled'
    }
    dispatch(setPendingStatus(data));
  } 

  const submitFriendToken = (oFriendToken) => {
    //verifying if friend token exists
    const dbRef = ref(database);
    get(child(dbRef, oFriendToken + '/friends/')).then((snapshot) => {
      if(snapshot.exists()){

        const data = {
          pendingFriendToken: 'temp' + oFriendToken
        }
        dispatch(setPendingFriendToken(data));

      }else{
        alert('invalid Token');
      }
    })
  }

  const getCurrentLocation = async() => {
    let { status } = await requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    await getCurrentPositionAsync({}).then((location) => {
      const data = {
        loc: {
          latitude: location.coords.latitude.toFixed(3),
          longitude: location.coords.longitude.toFixed(3)
        }
      }
      dispatch(setCurrentLocation(data))
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: .01,
        longitudeDelta: .01,
      });
    });
  }

  const getFriendsLocation = ((userId) => {

    const dbRef = ref(database);

    const parsedLocations = [];
    let pendingFriendRequest = {};
    let pendingFriendStatus = "";
    let pendingFriendToken = "";
    let friendToken = "";
    get(child(dbRef, userId.substring(0,6) + '/friends')).then((snapshot) => {
        //Checking if user exists
        if(snapshot.exists()){
          //going through all child elements {a:{}} => a
             snapshot.forEach((child) => {
              //sifting through all keys
                switch(child.key){
                  case "friendToken": 
                    friendToken = child.val();
                    break;  
                  case "pendingFriendRequest": 
                    pendingFriendRequest = child.val();
                    pendingFriendStatus = child.val().status;
                    pendingFriendToken = child.val().friendToken;
                    break;
                  default: 
                    let user = {};
                    child.forEach((grandChild) => {

                      //Sifiting through langLAng objc and current name

                      switch(grandChild.key){
                        case "name" :
                          user["name"] = grandChild.val();
                          break;
                        default: 
                          const retreivedLoc = {};
                          grandChild.forEach((latLng) => {
                            const val = parseFloat(latLng.val());
                            const key = latLng.key;
                            retreivedLoc[key + ""] = val;
                          })
                          user["latLng"] = retreivedLoc;
                      } 
                    })
                    parsedLocations.push(user);
                    break;
                }
                
            })
            
            if(pendingFriendStatus == 'needsAction' || pendingFriendStatus == 'pending'){
              console.log("pending");
              const data = {
                pendingFriend: pendingFriendRequest,
                pendingFriendStatus: pendingFriendStatus,
                pendingFriendToken: pendingFriendToken
              }
              dispatch(setPendingFriend(data));
            }else if(pendingFriendStatus == 'fulfilled'){
              console.log('uploading');
              const data = {
                pendingFriendStatus: 'upload',
                pendingFriend: pendingFriendRequest,
                pendingFriendToken: pendingFriendToken
              }
              dispatch(setPendingFriend(data));
            }

            console.log(parsedLocations);
            const loc = {
              friends: parsedLocations,
              isLive: true,
              friendToken: friendToken
            }
            dispatch(setFriendsLocation(loc))
        }
    })
  })

  /**
   * USE EFFECTS
   */


  useEffect(() => {
    if(pendingFriendToken != null && pendingFriendToken.includes('temp')){
      activatePendingFriendRequest(friendToken, username, pendingFriendToken.substring(4));
    }
  }, [pendingFriendToken, friendToken, username])

  useEffect(() => {
    if(pendingFriendStatus == 'fulfilled'){
      updateStatusToFulfilled(friendToken, pendingFriendToken);
    } else if(pendingFriendStatus == 'upload'){
      console.log(pendingFriendToken);
      addUsersAsFriends(pendingFriendToken, currentLoc, username, friendToken);
      dispatch(resetPendingFriendRequest());
    }
  }, [pendingFriendStatus, pendingFriendToken, friendToken, currentLoc, username])

  useEffect(() => {
    getCurrentLocation();
    getFriendsLocation(auth.currentUser.uid);
  }, [])

  useEffect(() => {
    if(region){
      map.current.animateToRegion(region, 1000);
    }
  }, [region]);

  
  const loc = {
    latitude: 41.739,
    longitude: -87.554,
  }

  return(
      <View style={styles.container}>
        <StatusBar></StatusBar>
        <MapView style={styles.map} showsUserLocation={true} ref={map} showsBuildings={true}>
          <Marker coordinate = {loc}></Marker>
          {isLive == true ? friendsLocation.map(marker => {
            <Marker title = {marker.name} key = {marker.name} coordinate={marker.latLng}></Marker>
          }): null}
        </MapView>
        <BottomSheet ref={sheetRef} snapPoints={snapPoints}>
          <BottomSheetView>
            <Formik initialValues={{friendToken: ''}} onSubmit={values => submitFriendToken(values.friendToken)}>
            {({handleChange, handleSubmit, values}) => (
              <View>
                <Text>Add another users friendToken</Text>
                <TextInput placeholder="Friend Token" onChangeText={handleChange('friendToken')} value = {values.friendToken}></TextInput>
                <Button title = "Add User As Friend" onPress={handleSubmit}></Button>
              </View>
            )}
            </Formik>
            {pendingFriendStatus == 'needsAction' ? (
                <View>
                  <Text>Accept friend request from {pendingFriend.username}</Text>
                  <Button title = "accept" onPress={acceptFriendRequest}></Button>
                </View>
            ) : null}
            {pendingFriendStatus == 'pending' ? (
                <View>
                  <Text>Waiting for {pendingFriend.friendToken} to accept request</Text>
                </View>
            ) : null}
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
});