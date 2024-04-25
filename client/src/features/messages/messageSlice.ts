import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentMessageChat: [],
    unreadMessage: [],
}

const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setCurrentChatMessasges: (state, action) => {
            state.currentMessageChat = action.payload
        },
        setUreadMessage: (state, action) => {
            state.unreadMessage.push(action.payload)
        },
        setFilterUnreadMessge: (state, action) => {
            state.unreadMessage = action.payload
        }
    }
})

export const { setCurrentChatMessasges, setUreadMessage, setFilterUnreadMessge } = messageSlice.actions

export default messageSlice.reducer

export const selectCurrentChatMessages = (state: any) => state.message.currentMessageChat
export const selectUnreadMessage = (state: any) => state.message.unreadMessage
