import 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer} from '@react-navigation/native';
import * as Linking from 'expo-linking';
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
import { selectFontIsLoaded, selectIsDeepLinkForeground, selectIsLoggedIn, selectNewUser, selectUserToken, selectVerificationCode, setFontIsLoaded, setIsDeepLinkForeground } from './redux/authSlice';
import { useSelector, useDispatch } from 'react-redux/';
import { selectFriendsList, selectUsername } from './redux/firestoreSlice';
import { selectCurrentLocation, selectCurrentLocationIsLoaded, selectFriendsLocation, selectFriendToken, 
    selectLoadAddFriends, 
    selectLoadFriendsLocation, selectPendingFriendName, selectPendingFriendStatus, selectPendingFriendToken } from './redux/RTDatabseSlice';
import { setSignIn } from "./redux/authSlice";
import { getUsername } from "./redux/firestoreSlice";
import { getCurrentLocation, setFriendToken } from "./redux/RTDatabseSlice";
//firebase imports
import { getAuth } from 'firebase/auth';
//font imports
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { HeaderRightButton } from './views/headerButtons/HeaderRight';

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function AppRoute(){
    
    const dispatch = useDispatch();
    const auth = getAuth();

    //auth slice variables
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const userToken = useSelector(selectUserToken);
    const newUser = useSelector(selectNewUser);
    const fontIsLoaded = useSelector(selectFontIsLoaded);
    const verificationCode = useSelector(selectVerificationCode);
    const isDeepLinkForeground = useSelector(selectIsDeepLinkForeground);

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
    const pendingFriendToken = useSelector(selectPendingFriendToken);8

    const loadFonts = async() => {
        await Font.loadAsync({
            'TextFont': require('./assets/GloriaHallelujah-Regular.ttf')
        }).then(() => {
            SplashScreen.hideAsync();
            dispatch(setFontIsLoaded({fontIsLoaded: true}));
        })

    }

    const getInitialUrl = async() => {
        const initialUrl = await Linking.getInitialURL();
        if(initialUrl){
            console.log(Linking.parse(initialUrl));
        }
    }

    useEffect(() => {
        Linking.addEventListener('url', (e) => {
            console.log(Linking.parse(e.url))
            dispatch(setIsDeepLinkForeground({isDeepLinkForeground: true}))
        })
        if(!isDeepLinkForeground){
            getInitialUrl();
        }

        loadFonts();

        return () => {
            Linking.removeEventListener("url");
        }

    }, [])

    if(!fontIsLoaded){
        return null;
    }

    auth.onAuthStateChanged((user) => {
        if(user && (newUser == null)){
            dispatch(setFriendToken({friendToken: user.uid.substring(0,6)}))
            dispatch(getUsername(user.uid));
            dispatch(getCurrentLocation());
  
            const data = {
            isLoggedIn: true,
            userToken: user.uid,
            newUser: false
            };
            dispatch(setSignIn(data));
        }
    })

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