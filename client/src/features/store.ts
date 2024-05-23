import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { apiSlice } from "./chat/api/apiSlice";
import authSlice from "./auth/authSlice";
import chatSlice from "./chat/chatSlice";
import messageSlice from "./messages/messageSlice";

const persistConfig = {
    key: "root",
    storage,
    // blacklist: []
};

const appReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
    chat: chatSlice,
    message: messageSlice
});

const rootReducer = (state, action) => {
    if (action.type === "RESET") {
        state = undefined
    }
    return appReducer(state, action);
}
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true
    ,
});