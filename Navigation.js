import 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer} from '@react-navigation/native';
//importing views
import { renderHome } from './views/Home';
import { renderNearYou } from './views/NearYou';
import { renderSignUp } from './views/SignUp';
import { renderLanding } from './views/Landing';
import { renderProfile } from './views/Profile';
//redux imports
import { selectIsLoggedIn } from './redux/authSlice';
import { useSelector } from 'react-redux/';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function AppRoute(){

    const isLoggedIn = useSelector(selectIsLoggedIn);

    return(
        <NavigationContainer>
            {isLoggedIn == false ? (
            <Stack.Navigator screenOptions={{
                headerShown: false,
                tabBarStyle: { display: "none"}
            }}>
                <Stack.Screen name = "Landing">{renderLanding}</Stack.Screen>
                <Stack.Screen name = "SignUp">{renderSignUp}</Stack.Screen>
            </Stack.Navigator>
            ) : (
            <Tab.Navigator screenOptions={{headerShown: false}}>
                <Tab.Screen name="Home">{renderHome}</Tab.Screen>
                <Tab.Screen name="NearYou">{renderNearYou}</Tab.Screen>
                <Tab.Screen name="Profile">{renderProfile}</Tab.Screen>
            </Tab.Navigator>
            )}
        </NavigationContainer>
    );
}