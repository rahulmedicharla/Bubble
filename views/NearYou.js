import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getAuth } from 'firebase/auth';
import { loadFriendsLocations, selectFriendsLocation, selectIsLive, setFriendsLocation } from '../redux/RTDatabseSlice';
import { useDispatch, useSelector } from 'react-redux';
import { child, get, getDatabase, ref } from 'firebase/database';

//https://github.com/react-native-maps/react-native-maps

export const renderNearYou = () => {

  const auth = getAuth();

  const [region, setRegion] = useState(null);

  const friendsLocation = useSelector(selectFriendsLocation);
  const isLive = useSelector(selectIsLive);

  const dispatch = useDispatch();
  //const friendsLocation = useSelector(selectFriendsLocation);

  const map = useRef(null);

  const getCurrentLocation = async() => {
    let { status } = await requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await getCurrentPositionAsync({});
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: .01,
      longitudeDelta: .01,
    });
  }

  const getFriendsLocation = ((userId) => {
    console.log("trying");
    const database = getDatabase();
    const dbRef = ref(database);

    const parsedLocations = [];
    get(child(dbRef, userId + '/friends')).then((snapshot) => {
        console.log("snapshot worked");
        if(snapshot.exists()){
            snapshot.forEach((child) => {
                let user = {};
                child.forEach((grandChild) => {
                    const val = parseFloat(grandChild.val());
                    const key = grandChild.key;
                    user[key + ""] = val;
                })
                parsedLocations.push(user);
            })
            const loc = {
              friends: parsedLocations,
              isLive: true
            }
            dispatch(setFriendsLocation(loc))
        }
    })
  })

  useEffect(() => {
    getCurrentLocation();
    getFriendsLocation(auth.currentUser.uid);
  }, [])

  useEffect(() => {
    console.log(friendsLocation);
    
  }, [friendsLocation])

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
            {isLive && friendsLocation.map(marker => (
              <Marker key={marker.latitude} coordinate={marker}/>
            ))}
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