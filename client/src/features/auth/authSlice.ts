import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredientials: (state, action) => {
            state.user = action.payload?.data?.user
            state.token = action.payload?.data?.accessToken
        },
        setLogout: (state) => {
            state.token = null
            state.user = null
        }
    }
})

export const { setCredientials, setLogout } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state: any) => state.auth.user
export const selectCurrentToken = (state: any) => state.auth.token