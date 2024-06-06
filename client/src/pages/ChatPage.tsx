import { ScrollArea } from '@/components/ui/scroll-area'
import { selectCurrentToken, selectCurrentUser } from '@/features/auth/authSlice'
import { useGetAllChatQuery } from '@/features/chat/chatApi'
import { selectAllChats, selectCurrentChat, selectSearchChats, setAllChat, setCurrentChat, setOtherParicipantChat, setSearchChats } from '@/features/chat/chatSlice'
import { useGetMessageQuery } from '@/features/messages/messageApi'
import { selectCurrentChatMessages, selectUnreadMessage, setCurrentChatMessasges, setIsSelectionOpen, setReplyMessage, setReplyOpen, setSelectedMessage, setUreadMessage } from '@/features/messages/messageSlice'
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



export default function ChatPage() {

    const dispatch = useDispatch()
    const { data, refetch: refetchChats } = useGetAllChatQuery(null)
    const [typing, setTyping] = useState(false)
    const [typingData, setTypingData] = useState([])
    const [chatId, setChatId] = useState(null)
    const [newMessage, setNewMessage] = useState()
    const [searchInputValue, setSearchInputValue] = useState('')
    const { data: message, refetch, isLoading: isMessageLoading, isFetching: isMessageFetching } = useGetMessageQuery(chatId)
    const [newChat, setNewChat] = useState([])
    useEffect(() => {
        console.log("Is Loading ", isMessageLoading)
        console.log("Is Fetchign ", isMessageFetching)
        refetch()
        dispatch(setCurrentChatMessasges(message?.message))
    }, [message, chatId])

    useEffect(() => {
        refetchChats()
        dispatch(setAllChat(data?.data))
        dispatch(setSearchChats(data?.data))
    }, [data])


    const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(null)
    const currentChat = useSelector(selectCurrentChat)
    const chat = useSelector(selectAllChats)
    const user = useSelector(selectCurrentUser)
    const token = useSelector(selectCurrentToken)
    const currentMessage = useSelector(selectCurrentChatMessages)
    const searchChats = useSelector(selectSearchChats)
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
    const initSocket = () => {
        return socketio("http://localhost:4000", {
            withCredentials: true,
            extraHeaders: {
                token
            }
        })
    }

    const newMessageHandler = (data): any => {
        if (currentChat?._id !== data?.chat) dispatch(setUreadMessage(data))
        else {
            setNewMessage(data)
        }
        console.log("data", data)
    }
    const handleStopTyping = (data): any => {
        setTyping(false)
        setTypingData([])
    }
    const handleStartTyping = (data): any => {
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
        console.log("dispatch this chat")
    }
    const formatTime = (time) => {
        if (!time) return ""
        const mongoDate = new Date(time)
        const timeInLT = moment(mongoDate).format('LT')
        return timeInLT
    }
    useEffect(() => {
        setSocket(initSocket())
    }, [token])

    useEffect(() => {
        chat?.map((c) => {
            socket?.emit("joinUser", c?._id)
        })
    }, [chat, chatId, token, socket, currentChat])

    useEffect(() => {
        socket?.on("newMessage", newMessageHandler)
        socket?.on("emitStartTyping", handleStartTyping)
        socket?.on("emitStopTyping", handleStopTyping)
        socket?.on("newChat", newChatHandler)
        return () => {
            socket?.off("newMessage", newMessageHandler)
            socket?.off("emitStartTyping", handleStartTyping)
            socket?.off("emitStopTyping", handleStopTyping)
            socket?.off("newChat", newChatHandler)
        }
    }, [socket, chatId])
    const unreadMessage = useSelector(selectUnreadMessage)

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
        <div className="flex  ">
            <div className="max-w-[420px] w-full flex flex-col h-screen">
                <ChatHeadingTop />
                <SearchBarTop setSearchInputValue={setSearchInputValue} searchInputValue={searchInputValue} />
                <ScrollArea className="h-screen">
                    {
                        searchChats && searchChats?.map((d, i) => {
                            const unread = unreadMessage?.filter((uread) => {
                                if (uread?.chat === d?._id) return uread
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
                        !searchChats?.length && <div className='flex  justify-center items-center font-bold text-xl pt-14'>No Chats To Display !</div>
                    }
                </ScrollArea>
            </div>
            <div className="w-full border flex flex-col h-screen">
                <ChatTopBar typing={typing} typingData={typingData} />
                <ScrollArea className=" h-screen ">
                    <ChatMiddleBar isMessageLoading={isMessageLoading} isMessageFetching={isMessageFetching} />
                </ScrollArea>
                <ChatBottomBar socket={socket} />
            </div>
        </div>
    )
}
