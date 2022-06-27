import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export const renderNearYou = () => {
    const loc = {
        latitude: 41.739,
        longitude: -87.554,
      }
    
    return(
        <View style={styles.container}>
            <StatusBar></StatusBar>
            <MapView style={styles.map} showsUserLocation={true}>
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