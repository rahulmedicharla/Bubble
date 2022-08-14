import 'react-native-gesture-handler';
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
//redux imports
import { selectFontIsLoaded, selectIsDeepLinkForeground, selectIsLoggedIn, selectNewUser, selectUserToken, selectVerificationCode, setFontIsLoaded, setIsDeepLinkForeground, setSignOut } from './redux/authSlice';
import { useSelector, useDispatch } from 'react-redux/';
import { selectFriendsList, selectUpdateList, selectUsername } from './redux/firestoreSlice';
import { checkIfNewUser, newUserRLDB, selectCurrentLocation, selectCurrentLocationIsLoaded, selectEventLocations, selectFriendsEvents, selectFriendsLocation, selectFriendToken,  
    selectOnLoadZoomToLoc,  
    selectPendingFriendToken, selectPendingFriendUsername, setPendingFriend} from './redux/RTDatabseSlice';
import { setSignIn } from "./redux/authSlice";
import { getUsername, getFriendsList } from "./redux/firestoreSlice";
import { getCurrentLocation, setFriendToken } from "./redux/RTDatabseSlice";
//firebase imports
import { getAuth } from 'firebase/auth';
//font imports
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { HeaderRightButton } from './views/subComponents/HeaderRight';
import { Asset } from 'expo-asset';

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
    const updateList = useSelector(selectUpdateList);

    //RTDB slice variables
    const friendsLocation = useSelector(selectFriendsLocation);
    const eventLocations = useSelector(selectEventLocations);
    const friendsEvents = useSelector(selectFriendsEvents);

    const friendToken = useSelector(selectFriendToken);
    const currentLoc = useSelector(selectCurrentLocation);
    const currentLocIsLoaded = useSelector(selectCurrentLocationIsLoaded);
    const onLoadZoomToLoc = useSelector(selectOnLoadZoomToLoc);
    
    const pendingFriendToken = useSelector(selectPendingFriendToken);
    const pendingFriendUsername = useSelector(selectPendingFriendUsername);

    const imagesToLoad =  [
        require('./assets/background.png'), 
        require('./assets/logo.png'),
        require('./assets/selectionIcons/cancelSelection.png'),
        require('./assets/selectionIcons/selectModal.png'),
        require('./assets/emojis/viewEvents.png'),
        require('./assets/emojis/createEvent.png'),
        require('./assets/emojis/addFriends.png')
    ]

    const loadFonts = async() => {
        await Font.loadAsync({
            'TextBold': require('./assets/fonts/AlbertSans-SemiBold.ttf'),
            'TextLight': require('./assets/fonts/AlbertSans-Light.ttf'),
            'TextNormal': require('./assets/fonts/AlbertSans-Regular.ttf')
        })

    }

    const loadImages = () => {
        imagesToLoad.map((image) => {
            Asset.fromModule(image).downloadAsync();
        })
    }

    const getInitialUrl = async() => {
        const initialUrl = await Linking.getInitialURL();
        if(initialUrl.includes("pendingFriendRequest")){
            parseData(initialUrl);
        }
    }

    const parseData = (url) => {
        const pendingFriendRequest = Linking.parse(url);
        const data = {
            pendingFriendToken: pendingFriendRequest.queryParams.friendToken,
            pendingFriendUsername: pendingFriendRequest.queryParams.username
        }

        dispatch(setPendingFriend(data));
        
    }

    useEffect(() => {
        const linking = Linking.addEventListener('url', (e) => {
            parseData(e.url);
            dispatch(setIsDeepLinkForeground({isDeepLinkForeground: true}))
        })
        
        if(!isDeepLinkForeground){
            getInitialUrl();
        }

        loadFonts().then(() => {
            loadImages();
            dispatch(setFontIsLoaded({fontIsLoaded: true}));
        })

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if(user){
                checkIfNewUser(user.uid).then((userExists) => {
                    if(userExists){
                        dispatch(getUsername(user.uid));
                        dispatch(getFriendsList(user.uid));
                        dispatch(getCurrentLocation());
                    }else{
                        newUserRLDB(user.uid);
                    }
                    dispatch(setFriendToken({friendToken: user.uid.substring(0,6)}))
                    const data = {
                        isLoggedIn: true,
                        userToken: user.uid,
                        newUser: !userExists
                    };
                    dispatch(setSignIn(data));
                })
            }else{
                dispatch(setSignOut());
            }
            
            SplashScreen.hideAsync();
        })

        return () => {
            linking.remove();
            unsubscribe();
        };

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
                    <Stack.Screen name = "SignUp" options={{headerShown: false}} children={(props) => <SignUpPage {...props}
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
                                            eventLocations = {eventLocations}
                                            friendsEvents = {friendsEvents}
                                            friendToken = {friendToken}
                                            username = {username}
                                            friendsList = {friendsList}
                                            updateList = {updateList}
                                            pendingFriendToken = {pendingFriendToken}
                                            pendingFriendUsername = {pendingFriendUsername}
                                            onLoadZoomToLoc = {onLoadZoomToLoc}
                                            currentLoc = {currentLoc} ></NearYouPage>}>
                                    </Stack.Screen>

                                    <Stack.Screen name="Home" children={(props) => <HomePage {...props} 
                                        username = {username}></HomePage>}>
                                    </Stack.Screen>

                                    <Stack.Screen name="Profile" options={{headerShown :false}} children={(props) => <ProfilePage {...props}
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