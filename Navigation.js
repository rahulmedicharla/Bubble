import 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer} from '@react-navigation/native';
//importing views
import { HomePage } from './views/Home';
import { NearYouPage } from './views/NearYou';
import { SignUpPage } from './views/SignUp';
import { LandingPage } from './views/Landing';
import { ProfilePage } from './views/Profile';
//redux imports
import { selectIsLoggedIn, selectUserToken } from './redux/authSlice';
import { useSelector } from 'react-redux/';
import { selectProfilePic, selectUsername } from './redux/firestoreSlice';
import { selectCurrentLocation, selectFriendsLocation, selectFriendToken, selectIsLive } from './redux/RTDatabseSlice';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function AppRoute(){

    //auth slice variables
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const userToken = useSelector(selectUserToken);

    //firestore slice variables
    const username = useSelector(selectUsername);
    const profilePicUrl = useSelector(selectProfilePic);

    //RTDB slice variables
    const friendsLocation = useSelector(selectFriendsLocation);
    const friendToken = useSelector(selectFriendToken);
    const isLive = useSelector(selectIsLive);
    const currentLoc = useSelector(selectCurrentLocation);

    return(
        <NavigationContainer>
            {isLoggedIn == false ? (
            <Stack.Navigator screenOptions={{headerShown: false, tabBarStyle: { display: "none"}}}>

                <Stack.Screen name = "Landing" children={(props) => <LandingPage {...props}></LandingPage> }></Stack.Screen>
                <Stack.Screen name = "SignUp" children={(props) => <SignUpPage {...props}></SignUpPage>}></Stack.Screen>

            </Stack.Navigator>

            ) : (

            <Tab.Navigator screenOptions={{headerShown: false}}>

                <Tab.Screen name="Home" children={(props) => <HomePage {...props} 
                    username = {username}></HomePage>}>
                </Tab.Screen>
                
                <Tab.Screen name="NearYou" children={(props) => <NearYouPage {...props} 
                    friendsLocation = {friendsLocation}
                    friendToken = {friendToken}
                    isLive = {isLive}
                    currentLoc = {currentLoc} ></NearYouPage>}>
                </Tab.Screen>

                <Tab.Screen name="Profile" children={(props) => <ProfilePage {...props}
                    username = {username}
                    profilePicUrl = {profilePicUrl}
                    userToken = {userToken}
                    friendToken = {friendToken}></ProfilePage>}>
                </Tab.Screen>

            </Tab.Navigator>
            )}
        </NavigationContainer>
    );
}