import { configureStore } from "@reduxjs/toolkit";
import authSlice from './authSlice'
import firestoreSlice from "./firestoreSlice";
import RTDatabseSlice from "./RTDatabseSlice";

export const store = configureStore({
    reducer: {
        firestore: firestoreSlice,
        userAuth: authSlice,
        realtimeDatabase: RTDatabseSlice,
    },
})