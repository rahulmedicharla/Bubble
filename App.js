import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
//importing views
import { renderHome } from './views/HomeScreen';
import { renderLogin } from './views/Login';
import { renderNearYou } from './views/NearYou';
import { renderSignUp } from './views/SignUp';


let signedIn = true;

const Tab = createBottomTabNavigator();

export default function App() {
  if(signedIn){
    return(
      <NavigationContainer>
        <Tab.Navigator screenOptions={{headerShown: false}}>
          <Tab.Screen name="Home">{renderHome}</Tab.Screen>
          <Tab.Screen name="NearYou">{renderNearYou}</Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    );
  }else{
    return(
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="SignIn">{renderSignUp}</Tab.Screen>
          <Tab.Screen name="NewAcct">{renderLogin}</Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}
