import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

//https://github.com/react-native-maps/react-native-maps

export const renderNearYou = () => {

  const [region, setRegion] = useState(null);

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

  useEffect(() => {
    getCurrentLocation();
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