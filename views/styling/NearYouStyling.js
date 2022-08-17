import { StyleSheet, Dimensions } from "react-native";

export default styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    map: {
      width: Dimensions.get('window').width, 
      height: Dimensions.get('window').height,
      zIndex: -1,
    },
    footerButton: {
      position: 'absolute',
      zIndex: 10,
      bottom: 35,
      right: 25
    },
    footerSelection: {
      position: 'absolute',
      zIndex: 10,
      right: 25,
      bottom: 30,
      alignItems: 'flex-end'
    },
    backgroundImg: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalBackground: {
      height: '100%',
    },
    modalViewContainer:{
    },
    selectionEmoji: {
      marginLeft: 13
    },
    selectionButton: {
      marginBottom: 5
    },
    customSelection: {
      marginBottom: 17,
      backgroundColor: 'white',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: 'rgba(0,0,0, .4)', 
      shadowOffset: { height: 1, width: 1 }, 
      shadowOpacity: 1, 
      shadowRadius: 1, 
    },
    selectionText: {
      fontFamily: 'TextBold',
      marginLeft: 11,
      paddingRight: 29,
      paddingTop: 10,
      paddingBottom: 9,
      color: '#454A4D',
      fontSize: 15,
    },
    createEventText: {
      fontFamily: 'TextBold',
      fontSize: 17,
      marginTop: 30,
      marginLeft: '10%'
    },
    createEventInputs: {
      marginTop: 5,
      paddingLeft: 10,
      borderRadius: 7,
      fontFamily: "TextBold",
      color: '#AFB9BF',
      backgroundColor: '#FFFFFF66',
      fontSize: 14
    },
    createEventName: {
      width: '38%'
    },
    createEventTime: {
      width: '18%'
    },
    timeInput: {
      inputBackgroundColor: '#FFFFFF66', 
      inputTextColor: '#454A4D', 
      inputBorderColor: 'transparent',  
      toggleButtonBackgroundColor: 'transparent',
      toggleButtonTextColor: '#454A4D',
      toggleButtonActiveBackgroundColor: '#FFFFFF',
      toggleButtonActiveTextColor: '#AFB9BF',
      errorTextColor: 'transparent'
    },
    createEventContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginLeft: '10%'
    },
    placesInputContainer: {
      position: 'relative',
      marginTop: 16,
      width: '81%',
      backgroundColor: 'transparent',
      borderRadius: 10,
      marginLeft: 35
    },
    placesInputBox: {
      paddingTop: 13,
      paddingBottom: 13,
      paddingLeft: 16,
      paddingRight: 10,
      fontSize: 14,
      borderRadius: 7,
      backgroundColor: "#FFFFFF85",
      fontFamily: "TextBold",
      color: '#AFB9BF',
      right: 8
    },
    createEventButton: {
      flexDirection:'row',
      alignItems: 'center',
      backgroundColor: 'white',
      width: 158,
      borderRadius: 5,
      marginTop: 42,
      paddingTop: 2,
      paddingBottom: 2,
      marginLeft: '33%'
    },
    atText: {
      marginLeft: 10,
      marginRight: 12,
      bottom: 8,
    },
    smallText: {
      marginTop: 18,
      fontFamily: 'TextLight',
      fontSize: 10,
      marginLeft: '26%'
    },
    eventTitleStyle: {
      fontFamily: 'TextBold',
      fontSize: 18,
      marginLeft: '8%'
    },
    viewEventContainer: {
      marginLeft: '10%'
    },
    markerCallout: {
      borderRadius: 5,
      boxShadow: "rgba(69, 81, 88, 0.1)"
    },
    markerText: {
      fontFamily: 'TextBold',
      fontSize: 17, 
      paddingTop: 7,
      paddingBottom: 7,
      paddingLeft: 10,
      paddingRight: 11
    },
    pendingEventCallout: {
      borderRadius: 5,
      boxShadow: "rgba(69, 81, 88, 0.1)",
      backgroundColor: '#3B92F0',
      flexDirection: 'row'
    },
    pendingEventCalloutText: {
      fontFamily: 'TextBold',
      fontSize: 17, 
      paddingTop: 7,
      paddingBottom: 7,
      paddingLeft: 10,
      paddingRight: 11,
      color: '#FFFFFF'
    },
    eventMarker:{
      borderRadius: 5,
      boxShadow: "rgba(69, 81, 88, 0.1)",
      backgroundColor: '#F8D7D5',
      flexDirection: 'row'
    },
    eventText: {
      fontFamily: 'TextBold',
      fontSize: 17, 
      paddingTop: 7,
      paddingBottom: 7,
      paddingLeft: 10,
      paddingRight: 11,
      color: '#CD534C'
    },
    pendingReponseUser: {
      flexDirection: 'row',
      marginBottom: 10,
      alignItems: 'center',
    },
    pendingResponseIcon: {
      width: 23,
      height: 23
    },
    statusIcons: {
      position:'relative',
      right: 13,
      top: 4
    },
    pendingResponseUserName: {
      fontFamily: 'TextBold',
      color: '#434343',
      position: 'relative',
      right: 5,
      fontSize: 15
    },
    pendingResponseUserMetadata: {
      fontFamily: 'TextLight',
      color: '#AFAFAF',
      marginLeft: 3
    },
    statusChangeContainer: {
      marginTop: 30,
      flexDirection: 'row',
      width:'100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusAcceptedButton: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      borderRadius: 5,
      marginRight: 10,
    },
    statusAcceptedLogo: {
      marginLeft: 10,
      marginTop: 10,
      marginBottom: 10,
    },
    statusAcceptedText: {
      marginLeft: 10,
      marginRight: 15
    },
    segmentedContainer: {
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 10
    },
    segmentedContainerFriends:{
        flexDirection: 'row',
        marginTop: 30,
        marginBottom: 10,
        alignContent: 'center',
        marginLeft: '10%'
    },
    addFriendsSegmentText: {
        color: '#6D7377',
        fontFamily: 'TextBold',
        marginRight: '13%'
    },
    segmentedText: {
      color: '#6D7377',
      fontFamily: 'TextBold',
      marginRight: 30,
    },
    highlightedText: {
      textDecorationLine: 'underline'
    },
    eventLocationContainer:{
      marginTop: 4,
      marginBottom: 10
    },
    eventLocationText: {
      fontFamily: 'TextBold',
      color: '#434343',
      fontSize: 15,
      marginLeft: 6
    },
    eventLocationCount:{
      fontFamily: 'TextLight',
      marginLeft: 10,
      fontSize: 12
    },
    horizontalOrg: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    addRecContainer: {
      position: 'relative',
      width: '89%',
      backgroundColor: 'transparent',
      borderRadius: 10,
      marginBottom: 20
    },
    addRecInput: {
      fontSize: 14,
      borderRadius: 7,
      backgroundColor: "#FFFFFF85",
      fontFamily: "TextBold",
      color: '#AFB9BF',
      right: 8
    },
    addRecButton: {
      width: '89%',
      marginBottom: 20,
      alignItems: 'flex-end'
    },
    addRecText:{
      fontFamily: 'TextBold'
    },
    friendsListContainer: {        
    },
    friendsList: {
        flexDirection: 'row',
        marginLeft: '10%',
        alignItems: 'center',
        marginTop: 10,
    },
    friendText: {
        fontFamily: 'TextBold',
        marginLeft: 10,
        color: '#454A4D',
    },
    noFriendsContainer: {
        alignItems: 'center',
        justifyContent : 'center',
        right: 15,
        marginTop: 100,
        marginLeft: '10%'
    },
    infoText: {
        color: '#6D7377',
        fontFamily: 'TextLight',
        fontSize: 13
    },
    addFriendsNavButton: {
        marginTop: 35,
        flexDirection:"row",
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 5,

    },
    addFriendsEmoji: {
        marginLeft: 20
    },
    addFriendsNavText: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily: 'TextBold',
        marginRight: 22,
        marginTop: 8,
        marginBottom: 8
    },
    addFriendsTextContainer: {
        alignItems: 'center',
        marginTop: 15
    },
    pendingRequest: {
        marginLeft: '10%'
    }, 
    addFriendsLink: {
        marginLeft: '10%'
    },
    hLine: {
        marginTop: 40,
        marginBottom: 40,
        borderBottomColor: '#DFDFDF', 
        borderBottomWidth: 2,
        width: '90%'
    },
    inviteFriendsTitle: {
        color: '#454A4D',
        fontFamily: 'TextBold',
        fontSize: 17,
        marginBottom: 10
    },
    shareLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        width: '25%',
        borderRadius: 5
    },
    shareLinkIcon: {
        marginLeft: 10
    },
    shareLinkText: {
        marginLeft: 5,
        marginBottom: 9,
        marginTop: 7
    },
    pendingUser: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    pendingUserText: {
        marginLeft: 15,
        fontFamily: 'TextBold',
        fontSize: 15,
    },
    pendingResultContainer: {
        flexDirection: 'row',
        top: 4,
        marginLeft: '33%'

    },
    pendingInfoText: {
        fontFamily: 'TextBold',
        fontSize: 15
    },
    resultIcon: {
        marginLeft: 14
    }
  });