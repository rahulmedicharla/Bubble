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
import { selectIsLoggedIn, selectNewUser, selectUserToken } from './redux/authSlice';
import { useSelector } from 'react-redux/';
import { selectUsername } from './redux/firestoreSlice';
import { selectCurrentLocation, selectFriendsLocation, selectFriendToken, selectIsLive, selectLoadPendingFriendStatus, selectPendingFriendName, selectPendingFriendStatus, selectPendingFriendToken } from './redux/RTDatabseSlice';
import { useEffect } from 'react';
import { NewUserSetupPage } from './views/NewUserSetup';
import { AntDesign } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function AppRoute(){

    //auth slice variables
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const userToken = useSelector(selectUserToken);
    const newUser = useSelector(selectNewUser);

    //firestore slice variables
    const username = useSelector(selectUsername);

    //RTDB slice variables
    const friendsLocation = useSelector(selectFriendsLocation);
    const friendToken = useSelector(selectFriendToken);
    const isLive = useSelector(selectIsLive);
    const currentLoc = useSelector(selectCurrentLocation);

    const pendingFriendStatus = useSelector(selectPendingFriendStatus);
    const pendingFriendName = useSelector(selectPendingFriendName);
    const pendingFriendToken = useSelector(selectPendingFriendToken);
    const loadPendingFriendStatus = useSelector(selectLoadPendingFriendStatus);

    return(
        <NavigationContainer>
            {isLoggedIn == false ? (
                <Stack.Navigator screenOptions={{ tabBarStyle: { display: "none"}}}>

                    <Stack.Screen name = "Landing" options={{headerShown: false}} children={(props) => <LandingPage {...props}
                        ></LandingPage> }>
                    </Stack.Screen>
                    <Stack.Screen name = "SignUp" options={{headerBackTitleVisible :false}} children={(props) => <SignUpPage {...props}
                        ></SignUpPage>}>
                    </Stack.Screen>

                </Stack.Navigator>

            ) : (
                <Tab.Navigator screenOptions={{headerShown: false}}>
                    {newUser ? (
                        <Tab.Screen name="NewUserSetup" children={(props) => <NewUserSetupPage {...props}
                            userToken = {userToken}></NewUserSetupPage>}>
                        </Tab.Screen>
                    ):(
                        <Tab.Group>
                            <Tab.Screen name="Home" children={(props) => <HomePage {...props} 
                                username = {username}></HomePage>}>
                            </Tab.Screen>
                            
                            <Tab.Screen name="NearYou" children={(props) => <NearYouPage {...props} 
                                friendsLocation = {friendsLocation}
                                friendToken = {friendToken}
                                isLive = {isLive}
                                username = {username}
                                pendingFriendStatus = {pendingFriendStatus}
                                pendingFriendName = {pendingFriendName}
                                pendingFriendToken = {pendingFriendToken}
                                loadPendingFriendStatus = {loadPendingFriendStatus}
                                currentLoc = {currentLoc} ></NearYouPage>}>
                            </Tab.Screen>

                            <Tab.Screen name="Profile" children={(props) => <ProfilePage {...props}
                                username = {username}
                                userToken = {userToken}
                                friendToken = {friendToken}></ProfilePage>}>
                            </Tab.Screen>

                        </Tab.Group>
                    )}
                </Tab.Navigator>
            )}
        </NavigationContainer>
    );
}