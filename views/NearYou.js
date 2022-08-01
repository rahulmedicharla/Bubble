//react imports
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Button, Text, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Formik } from "formik";
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

//firebase imports
import { getAuth } from 'firebase/auth';
import { child, get, getDatabase, ref } from 'firebase/database';

//redux imports
import { setFriendsLocation, setCurrentLocation } from '../redux/RTDatabseSlice';
import { useDispatch } from 'react-redux';

//https://github.com/react-native-maps/react-native-maps
//https://gorhom.github.io/react-native-bottom-sheet/modal/usage

export const NearYouPage = ({navigation, friendsLocation, friendToken, isLive, currentLoc}) => {
  //firebase consts
  const auth = getAuth();
  const database = getDatabase();

  //react temp consts
  const [region, setRegion] = useState(null);
  const map = useRef(null);

  //AddFriends Modal Consts
  const sheetRef = useRef(null);
  const snapPoints = ["15%", "40%"]

  const dispatch = useDispatch();

  const submitFriendToken = (oFriendToken) => {
    //verifying if friend token exists
    const dbRef = ref(database);
    get(child(dbRef, oFriendToken + '/friends/')).then((snapshot) => {
      if(snapshot.exists()){


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

  /**
   * USE EFFECTS
   */

  useEffect(() => {
    //getCurrentLocation();
  }, [])

  useEffect(() => {
    if(region){
      map.current.animateToRegion(region, 1000);
    }
  }, [region]);

  return(
      <View style={styles.container}>
        <StatusBar></StatusBar>
        <MapView style={styles.map} showsUserLocation={true} ref={map} showsBuildings={true}>
          {friendsLocation.map(marker => {
            (<Marker coordinate={marker.latLng}></Marker>)
          })}
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