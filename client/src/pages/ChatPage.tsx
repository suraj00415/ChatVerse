import { ScrollArea } from '@/components/ui/scroll-area'
import { selectCurrentToken, selectCurrentUser } from '@/features/auth/authSlice'
import { useGetAllChatQuery } from '@/features/chat/chatApi'
import { selectAllChats, selectCurrentChat, selectSearchChats, setAllChat, setCurrentChat, setOtherParicipantChat, setSearchChats } from '@/features/chat/chatSlice'
import { useGetMessageQuery, useGetUnreadMessageQuery, useSetReadMessageMutation, useSetSentMessageMutation } from '@/features/messages/messageApi'
import { selectCurrentChatMessages, selectUnreadMessage, setCurrentChatMessasges, setFilterUnreadMessge, setIsSelectionOpen, setReplyMessage, setReplyOpen, setSelectedMessage, setUreadMessage } from '@/features/messages/messageSlice'
import ChatBottomBar from '@/myComponents/Chat/ChatBottomBar'
import ChatHeading from '@/myComponents/Chat/ChatHeading'
import ChatHeadingTop from '@/myComponents/Chat/ChatHeadingTop'
import ChatMiddleBar from '@/myComponents/Chat/ChatMiddleBar'
import ChatTopBar from '@/myComponents/Chat/ChatTopBar'
import SearchBarTop from '@/myComponents/Chat/SearchBarTop'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import socketio from "socket.io-client"
import useScreenSize from '@/hooks/useScreenSize'


export default function ChatPage() {

    const dispatch = useDispatch()
    const screenSize = useScreenSize()
    const { data, refetch: refetchChats } = useGetAllChatQuery(null)
    const [typing, setTyping] = useState(false)
    const [typingData, setTypingData] = useState([])
    const [chatId, setChatId] = useState(null)
    const [newMessage, setNewMessage] = useState()
    const [searchInputValue, setSearchInputValue] = useState('')
    const { data: message, refetch, isLoading: isMessageLoading, isFetching: isMessageFetching } = useGetMessageQuery(chatId)
    const [newChat, setNewChat] = useState([])
    const currentChat = useSelector(selectCurrentChat)
    const chat = useSelector(selectAllChats)
    const user = useSelector(selectCurrentUser)
    const token = useSelector(selectCurrentToken)
    const currentMessage = useSelector(selectCurrentChatMessages)
    const searchChats = useSelector(selectSearchChats)
    const unreadMessage = useSelector(selectUnreadMessage)
    const [deleteForEveryoneData, setDeleteForEveryoneData] = useState([])
    const { data: unreadMessageFetch, refetch: unreadRefetch } = useGetUnreadMessageQuery(null)
    const [readMessage] = useSetReadMessageMutation()
    const [sentMessage] = useSetSentMessageMutation()
    const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(null)
    const [statusMessage, setStatusMessage] = useState([])
    const [isConnected, setIsConnected] = useState(false)
    useEffect(() => {
        console.log("Unread Message:", unreadMessageFetch)
        unreadRefetch()
        dispatch(setFilterUnreadMessge(unreadMessageFetch?.data))
    }, [unreadMessageFetch])

    useEffect(() => {
        console.log("Is Loading ", isMessageLoading)
        console.log("Is Fetching ", isMessageFetching)
        refetch()
        if (message) {
            dispatch(setCurrentChatMessasges(message.message));
            console.log("Updated currentMessage: ", message.message);
            console.log("Updated currentChatMessage: ", currentMessage);
        }
    }, [message, chatId])

    useEffect(() => {
        refetchChats()
        dispatch(setAllChat(data?.data))
        dispatch(setSearchChats(data?.data))
    }, [data])

    useEffect(() => {
        const searchChat = chat?.filter((c) => {
            if (searchInputValue === "") return c
            let otherParticipant = c?.participants?.filter((participant) => {
                if (participant?._id !== user?._id) return participant
            })
            if (otherParticipant?.length === 1 && otherParticipant[0]?.name.toLowerCase()?.includes(searchInputValue.toLowerCase())) return c
            else if (c?.isGroup && c?.Group?.name?.toLowerCase()?.includes(searchInputValue.toLowerCase())) return c
        })
        dispatch(setSearchChats(searchChat))
    }, [searchInputValue, chat])

    useEffect(() => {
        if (newMessage) {
            dispatch(setCurrentChatMessasges([...currentMessage, newMessage]))
        }
        console.log("current chat", currentMessage)
    }, [newMessage])

    useEffect(() => {
        setChatId(currentChat?._id)
    }, [currentChat])

    useEffect(() => {
        console.log("NEW CHAT KDSK", newChat)
        if (newChat?.length) {
            dispatch(setAllChat([...newChat, ...chat]))
            dispatch(setSearchChats([...newChat, ...chat]))
        }
    }, [newChat])
    useEffect(() => {
        if (deleteForEveryoneData.length) {
            const deletedChatMessages = currentMessage?.map((msg) => {
                const index = deleteForEveryoneData?.findIndex((d) => d?.message?._id === msg?.messageId)
                console.log("index", index)
                if (index !== -1) {
                    return { ...msg, ...deleteForEveryoneData[index] }
                }
                return msg
            })
            console.log("Updated Messages: ", deletedChatMessages)
            dispatch(setCurrentChatMessasges(deletedChatMessages))
        }
    }, [deleteForEveryoneData])
    useEffect(() => {
        console.log("Status Edited Called")
        if (statusMessage) {
            const statusEditedMessages = currentMessage?.map((msg) => {
                if (statusMessage?.messageId === msg?.messageId) {
                    return { ...msg, ...statusMessage }
                }
                return msg
            })
            console.log("Status Edited Message: ", statusEditedMessages)
            dispatch(setCurrentChatMessasges(statusEditedMessages))
        }

    }, [statusMessage])
    const connectionFunction = async () => {
        try {
            const messageIds = unreadMessageFetch?.data?.map((d) => d?.messageId)
            console.log(messageIds)
            if (messageIds?.length) {
                await sentMessage({ messageIds })
            }
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (isConnected) {
            connectionFunction()
        }
    }, [isConnected])

    const initSocket = () => {
        return socketio("http://localhost:4000", {
            withCredentials: true,
            extraHeaders: {
                token
            }
        })
    }

    const newMessageHandler = async (data) => {
        if (currentChat?._id !== data?.message?.chat) {
            dispatch(setUreadMessage(data))
            console.log("Data Unread But Sent", data)
            try {
                const messageIds = [data?.messageId]
                const dataSent = {
                    messageIds
                }
                console.log("Data Sent:", dataSent)
                await sentMessage(dataSent)
            } catch (error) {
                console.log(error)
            }
        } else {
            setNewMessage(data)
            try {
                const messageIds = [data?.messageId]
                const dataSent = {
                    messageIds
                }
                await sentMessage(dataSent)
                await readMessage(dataSent)
            } catch (error) {
                console.log(error)
            }
        }
        console.log("data", data)
        console.log("message handler Current Chat:", currentMessage)
    }

    const handleStopTyping = (data) => {
        setTyping(false)
        setTypingData([])
    }

    const handleStartTyping = (data) => {
        if (currentChat?._id !== data?.chatId) return
        setTyping(true)
        setTypingData(data)
        setTypingData(Array.from([data]))
    }

    const newChatHandler = (data) => {
        console.log("new Chats", data)
        if (Object.keys(data)?.length) {
            setNewChat([data])
        }
    }
    const onConnectionHandler = async (data) => {
        console.log("Connected.................")
        setIsConnected(true)
    }
    const deleteForEveryoneHandler = (data) => {
        setDeleteForEveryoneData(data)
    }
    const statusMessageHandler = (data) => {
        setStatusMessage(data)
        console.log("StatusMessage:", data)
    }
    const formatTime = (time) => {
        if (!time) return ""
        const mongoDate = new Date(time)
        return moment(mongoDate).format('LT')
    }

    useEffect(() => {
        setSocket(initSocket())
    }, [token])

    useEffect(() => {
        chat?.forEach((c) => {
            socket?.emit("joinUser", c?._id)
        })
    }, [chat, chatId, token, socket, currentChat])

    useEffect(() => {
        socket?.on("newMessage", newMessageHandler)
        socket?.on("connected", onConnectionHandler)
        socket?.on("statusMessage", statusMessageHandler)
        socket?.on("emitStartTyping", handleStartTyping)
        socket?.on("emitStopTyping", handleStopTyping)
        socket?.on("newChat", newChatHandler)
        socket?.on("deleteForEveryone", deleteForEveryoneHandler)
        return () => {
            socket?.off("newMessage", newMessageHandler)
            socket?.off("connected", onConnectionHandler)
            socket?.off("statusMessage", statusMessageHandler)
            socket?.off("emitStartTyping", handleStartTyping)
            socket?.off("emitStopTyping", handleStopTyping)
            socket?.off("newChat", newChatHandler)
            socket?.off("deleteForEveryone", deleteForEveryoneHandler)
        }
    }, [socket, chatId])

    useEffect(() => {
        const currChatData = chat?.filter((d) => {
            if (d?._id === currentChat?._id) return d
        })
        console.log("currChatData", currChatData)
        if (currChatData && currChatData?.length) {
            dispatch(setCurrentChat(currChatData[0]))
        }
    }, [data, chat])

    useEffect(() => {
        const otherParticipant = currentChat?.participants?.filter((participant) => {
            if (participant?._id !== user?._id) return participant
        })
        if (currentChat) {
            dispatch(setOtherParicipantChat(otherParticipant))
        }
    }, [currentChat])

    return (
        <div className="flex">
            <div className="max-w-[420px] w-full flex flex-col h-screen">
                <ChatHeadingTop />
                <SearchBarTop setSearchInputValue={setSearchInputValue} searchInputValue={searchInputValue} />
                <ScrollArea className="h-screen">
                    {
                        searchChats && searchChats?.map((d, i) => {
                            const unread = unreadMessage?.filter((uread) => {
                                if (uread?.message?.chat === d?._id) return uread
                            })
                            let otherParticipant = d?.participants?.filter((participant) => {
                                if (participant?._id !== user?._id) return participant
                            })
                            const message_person_name = d?.lastmessage?.sender?._id === user?._id ? "You" : d?.lastmessage?.sender?.name
                            return (
                                <div onClick={() => {
                                    dispatch(setReplyMessage(null))
                                    dispatch(setIsSelectionOpen(false))
                                    dispatch(setSelectedMessage([]))
                                    dispatch(setReplyOpen(false))
                                    dispatch(setCurrentChat(d))
                                }} key={i}>
                                    < ChatHeading chatId={d?._id} imageSrc={d?.isGroup ? d?.Group?.avatar : otherParticipant[0]?.avatar} name={d?.isGroup ? d?.Group?.name : otherParticipant[0]?.name} message={d?.lastmessage?.content} message_person_name={message_person_name} msgTime={formatTime(d?.lastmessage?.createdAt || "")} messageCount={unread?.length} />
                                </div>)
                        })
                    }
                    {
                        !searchChats?.length && <div className='flex justify-center items-center font-bold text-xl pt-14'>No Chats To Display !</div>
                    }
                </ScrollArea>
            </div>
            <div className={`w-full border flex flex-col h-screen ${screenSize.width > 1000 ? "" : "overflow-hidden"}`}>
                <ChatTopBar typing={typing} typingData={typingData} />
                <ScrollArea className={`${screenSize.width > 1000 ? "h-screen" : "h-full"}`}>
                    <ChatMiddleBar isMessageLoading={isMessageLoading} isMessageFetching={isMessageFetching} />
                </ScrollArea>
                <ChatBottomBar socket={socket} />
            </div>
        </div>
    )
}
