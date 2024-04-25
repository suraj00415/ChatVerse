import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentChat: null,
    chats: null,
    otherParticipant: null,
    searchChats: []
}

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setCurrentChat: (state, action) => {
            const chat = action.payload
            state.currentChat = chat
        },
        setAllChat: (state, action) => {
            const chat = action.payload
            state.chats = chat
        },
        setOtherParicipantChat: (state, action) => {
            state.otherParticipant = action.payload[0]
        },
        setSearchChats: (state, action) => {
            state.searchChats = action.payload
        }
    }
})

export const { setCurrentChat, setAllChat, setOtherParicipantChat, setSearchChats } = chatSlice.actions

export default chatSlice.reducer

export const selectAllChats = (state: any) => state.chat.chats
export const selectCurrentChat = (state: any) => state.chat.currentChat
export const selectOtherParticipants = (state: any) => state.chat.otherParticipant
export const selectSearchChats = (state: any) => state.chat.searchChats