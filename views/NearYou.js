import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getAuth } from 'firebase/auth';
import { selectCurrentLocation, selectFriendsLocation, selectFriendToken, selectIsLive, selectUploadLocToken, setCurrentLocation, setFriendsLocation, setUploadLocTokenFalse, uploadCurrentLoc } from '../redux/RTDatabseSlice';
import { useDispatch, useSelector } from 'react-redux';
import { child, get, getDatabase, ref } from 'firebase/database';
import { selectUsername } from '../redux/firestoreSlice';

//https://github.com/react-native-maps/react-native-maps

export const renderNearYou = () => {

  const auth = getAuth();
  const database = getDatabase();

  const [region, setRegion] = useState(null);

  const friendsLocation = useSelector(selectFriendsLocation);
  const isLive = useSelector(selectIsLive);
  const currentLoc = useSelector(selectCurrentLocation);
  const friendToken = useSelector(selectFriendToken);
  const username = useSelector(selectUsername);
  const uploadLocToken = useSelector(selectUploadLocToken);

  const dispatch = useDispatch();

  const map = useRef(null);

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
        },
        uploadLocToken : true,
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
    console.log("trying");
  
    const dbRef = ref(database);

    const parsedLocations = [];
    let FT = "";
    get(child(dbRef, userId.substring(0,6) + '/friends')).then((snapshot) => {
        console.log("snapshot worked");
        //Checking if user exists
        if(snapshot.exists()){
          //going through all child elements {a:{}} => a
             snapshot.forEach((child) => {
              //sifting through all keys
                switch(child.key){
                  case "friendToken": 
                    FT = child.val();
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
            console.log(parsedLocations);
            const loc = {
              friends: parsedLocations,
              isLive: true,
              friendToken: FT
            }
            dispatch(setFriendsLocation(loc))
        }
    })
  })

  useEffect(() => {
    getCurrentLocation();
    getFriendsLocation(auth.currentUser.uid);
  }, [])

  // useEffect(() => {
  //   if(currentLoc != null && friendToken != null && username != null && uploadLocToken){
  //     console.log('uploading current loc');
  //     uploadCurrentLoc(friendToken,currentLoc,username);
  //     dispatch(setUploadLocTokenFalse({uploadLocToken: false}))
  //   }
  // }, [currentLoc, friendToken, username])

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