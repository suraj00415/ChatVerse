import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentMessageChat: [],
    unreadMessage: [],
    replyMessage: null,
    isReplyOpen: false,
    selectedMessage: [],
    selectedUserMessage: [],
    isSelectionOpen: false,
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
        },
        setReplyOpen: (state, action) => {
            state.isReplyOpen = action.payload
        },
        setReplyMessage: (state, action) => {
            state.replyMessage = action.payload
        },
        setSelectedMessage: (state, action) => {
            state.selectedMessage = action.payload
        },
        setIsSelectionOpen: (state, action) => {
            state.isSelectionOpen = action.payload
        },
        setSelectedUserMessage: (state, action) => {
            state.selectedUserMessage = action.payload
        },
    }
})

export const { setSelectedUserMessage,setCurrentChatMessasges, setUreadMessage, setFilterUnreadMessge, setReplyMessage, setReplyOpen, setSelectedMessage, setIsSelectionOpen } = messageSlice.actions

export default messageSlice.reducer

export const selectCurrentChatMessages = (state: any) => state.message.currentMessageChat
export const selectUnreadMessage = (state: any) => state.message.unreadMessage
export const selectReplyMessage = (state: any) => state.message.replyMessage
export const selectIsReplyOpen = (state: any) => state.message.isReplyOpen
export const selectSelectedMessage = (state: any) => state.message.selectedMessage
export const selectSelectedUserMessage = (state: any) => state.message.selectedUserMessage
export const selectIsSelectionOpen = (state: any) => state.message.isSelectionOpen

