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
import { NewUserSetupPage } from './views/NewUserSetup';
import { LoadingPage } from './views/Loading';
import { AntDesign } from '@expo/vector-icons';
//redux imports
import { selectFontIsLoaded, selectIsLoggedIn, selectNewUser, selectUserToken, selectVerificationCode, setFontIsLoaded } from './redux/authSlice';
import { useSelector } from 'react-redux/';
import { selectFriendsList, selectUsername } from './redux/firestoreSlice';
import { selectCurrentLocation, selectCurrentLocationIsLoaded, selectFriendsLocation, selectFriendToken, 
    selectLoadAddFriends, 
    selectLoadFriendsLocation, selectPendingFriendName, selectPendingFriendStatus, selectPendingFriendToken } from './redux/RTDatabseSlice';
//font imports
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch } from 'react-redux';
import * as Font from 'expo-font';
import { HeaderRightButton } from './views/headerButtons/HeaderRight';

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function AppRoute(){

    //auth slice variables
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const userToken = useSelector(selectUserToken);
    const newUser = useSelector(selectNewUser);
    const fontIsLoaded = useSelector(selectFontIsLoaded);
    const verificationCode = useSelector(selectVerificationCode);

    //firestore slice variables
    const username = useSelector(selectUsername);
    const friendsList = useSelector(selectFriendsList);

    //RTDB slice variables
    const friendsLocation = useSelector(selectFriendsLocation);
    const friendToken = useSelector(selectFriendToken);
    const loadFriendsLocation = useSelector(selectLoadFriendsLocation);
    const currentLoc = useSelector(selectCurrentLocation);
    const currentLocIsLoaded = useSelector(selectCurrentLocationIsLoaded);

    const loadAddFriends = useSelector(selectLoadAddFriends);
    const pendingFriendStatus = useSelector(selectPendingFriendStatus);
    const pendingFriendName = useSelector(selectPendingFriendName);
    const pendingFriendToken = useSelector(selectPendingFriendToken);

    const dispatch = useDispatch();

    const loadFonts = async() => {
        await Font.loadAsync({
            'TextFont': require('./assets/GloriaHallelujah-Regular.ttf')
        })
    }

    useEffect(() => {
        loadFonts().then(() => {
            SplashScreen.hideAsync();
            dispatch(setFontIsLoaded({fontIsLoaded: true}))
        })
    }, [])

    if(!fontIsLoaded){
        return null;
    }

    return(
        <NavigationContainer>
            {isLoggedIn == false ? (
                <Stack.Navigator >

                    <Stack.Screen name = "Landing" options={{headerShown: false}} children={(props) => <LandingPage {...props}
                        ></LandingPage> }>
                    </Stack.Screen>
                    <Stack.Screen name = "SignUp" options={{headerBackTitleVisible :false}} children={(props) => <SignUpPage {...props}
                        verificationCode = {verificationCode}
                        ></SignUpPage>}>
                    </Stack.Screen>

                </Stack.Navigator>

            ) : (
                <Stack.Navigator>
                    {newUser ? (
                        <Stack.Screen name="NewUserSetup" children={(props) => <NewUserSetupPage {...props}
                            userToken = {userToken}></NewUserSetupPage>}>
                        </Stack.Screen>
                    ):(
                        <Stack.Group>
                            {currentLocIsLoaded ? (
                                <Stack.Group>
                                    <Stack.Screen name="NearYou" options={({navigation}) => ({ 
                                        //screen header options
                                        headerTransparent: true,
                                        headerRight: () => <HeaderRightButton navigation={navigation}></HeaderRightButton>})}
                                        //children props
                                        children={(props) => <NearYouPage {...props} 
                                            userToken = {userToken}
                                            friendsLocation = {friendsLocation}
                                            friendToken = {friendToken}
                                            loadFriendsLocation = {loadFriendsLocation}
                                            loadAddFriends = {loadAddFriends}
                                            username = {username}
                                            pendingFriendStatus = {pendingFriendStatus}
                                            pendingFriendName = {pendingFriendName}
                                            pendingFriendToken = {pendingFriendToken}
                                            friendsList = {friendsList}
                                            currentLoc = {currentLoc} ></NearYouPage>}>
                                    </Stack.Screen>

                                    <Stack.Screen name="Home" children={(props) => <HomePage {...props} 
                                        username = {username}></HomePage>}>
                                    </Stack.Screen>

                                    <Stack.Screen name="Profile" options={{headerBackTitleVisible :false}} children={(props) => <ProfilePage {...props}
                                        username = {username}
                                        userToken = {userToken}
                                        friendToken = {friendToken}></ProfilePage>}>
                                    </Stack.Screen>
                                </Stack.Group>
                            ):(
                                <Stack.Screen name = "LoadingPage" options = {{headerShown: false}} children = {(props) => <LoadingPage {...props}>
                                    </LoadingPage>}></Stack.Screen>
                            )}
                        </Stack.Group>
                    )}
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
}