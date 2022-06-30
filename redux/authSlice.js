import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    isLoggedIn: false,
    userToken: null
}

const authSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        setSignIn: (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn;
            state.userToken = action.payload.userToken;
        },
        setSignOut: (state) => {

            state.userToken = null;
            state.isLoggedIn = false;
        },
    }
});

export const { setSignIn, setSignOut } = authSlice.actions;

export const selectIsLoggedIn = (state) => state.userAuth.isLoggedIn;
export const selectUserToken = (state) => state.userAuth.userToken;

export default authSlice.reducer;
