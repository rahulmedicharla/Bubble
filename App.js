import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';

let signedIn = true;

function HomeScreen(){
  return(
    <View style={styles.container}>
      <Text>home</Text>

    </View>
  );
}

function NearYou(){
  const loc = {
    latitude: 41.739,
    longitude: -87.554,
  }

  return(
      <View style={styles.container}>
        <MapView style={styles.map} showsUserLocation={true}>
          <Marker coordinate = {loc}></Marker>
        </MapView>
      </View>
  );
}

function SignIn(){
  return(
    <View style={styles.container}>
      <Text>SignIn</Text>
    </View>
  );
}

function NewAcct(){
  return(
    <View style={styles.container}>
      <Text>acct</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  if(signedIn){
    console.log(signedIn);
    return(
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen}></Tab.Screen>
          <Tab.Screen name="NearYou" component={NearYou}></Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    );
  }else{
    console.log(signedIn);
    return(
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="SignIn" component={SignIn}></Tab.Screen>
          <Tab.Screen name="NewAcct" component={NewAcct}></Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
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
