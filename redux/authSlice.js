import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    isLoggedIn: false,
    userToken: null,
    newUser: null,
    fontIsLoaded: false,
    verificationCode: null,

}

const authSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        setSignIn: (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn;
            state.userToken = action.payload.userToken;
            state.newUser = action.payload.newUser;
        },
        setSignOut: (state) => {
            state.userToken = null;
            state.isLoggedIn = false;
            state.newUser = null;
        },
        setNewUserFalse: (state) => {
            state.newUser = false;
        },
        setFontIsLoaded: (state, action) => {
            state.fontIsLoaded = action.payload.fontIsLoaded
        },
        setVerificationCode: (state, action) => {
            state.verificationCode = action.payload.verificationCode;
        }
    }
});

export const { setSignIn, setSignOut, setNewUserFalse, setFontIsLoaded, setVerificationCode } = authSlice.actions;

export const selectIsLoggedIn = (state) => state.userAuth.isLoggedIn;
export const selectUserToken = (state) => state.userAuth.userToken;
export const selectNewUser = (state) => state.userAuth.newUser;
export const selectFontIsLoaded = (state) => state.userAuth.fontIsLoaded;
export const selectVerificationCode = (state) => state.userAuth.verificationCode;

export default authSlice.reducer;
