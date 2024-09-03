import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { selectCurrentChat } from '@/features/chat/chatSlice';
import { useDeleteForEveryoneMutation, useDeleteForMeMutation, useReplyMessageMutation, useSendMessageMutation } from '@/features/messages/messageApi';
import { selectCurrentChatMessages, selectIsReplyOpen, selectIsSelectionOpen, selectReplyMessage, selectSelectedMessage, selectSelectedUserMessage, setCurrentChatMessasges, setIsSelectionOpen, setReplyMessage, setReplyOpen, setSelectedMessage, setSelectedUserMessage } from '@/features/messages/messageSlice';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineSchedule } from "react-icons/ai";
import { BiSolidVideos } from "react-icons/bi";
import { BsEmojiSmile, BsImages } from 'react-icons/bs';
import { FaStar } from "react-icons/fa6";
import { GoLightBulb } from "react-icons/go";
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { IoSend } from "react-icons/io5";
import { MdDelete, MdOutlinePoll, MdOutlineScheduleSend } from "react-icons/md";
import { PiFilesBold } from "react-icons/pi";
import { RiShareForwardFill } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';
import { MessageWithEmojis } from "./MessageWithEmoji";
import UsersList from './UsersList';
import { useNavigate } from "react-router-dom";




export default function ChatBottomBar({ socket }) {
  const [value, setValue] = useState<string>("")

  const [showEmoji, setShowEmoji] = useState(false)
  const emojiPickerRef = useRef(null);
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const currentChatMessage = useSelector(selectCurrentChatMessages)
  const isReplyOpen = useSelector(selectIsReplyOpen)
  const replyMessage = useSelector(selectReplyMessage)
  const isSelectionOpen = useSelector(selectIsSelectionOpen)
  const selectedMessages = useSelector(selectSelectedMessage)
  const selectedUserMessages = useSelector(selectSelectedUserMessage)
  const [deleteForMe] = useDeleteForMeMutation()
  const [deleteForEveryone] = useDeleteForEveryoneMutation()
  const navigate = useNavigate()
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current?.contains(event.target)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [sendMessage] = useSendMessageMutation()
  const [replyMessages] = useReplyMessageMutation()
  const currentChat = useSelector(selectCurrentChat)

  const sendMessageHandler = async (e) => {
    e.preventDefault()
    if (!isReplyOpen && !replyMessage) {
      try {
        const data = {
          content: value,
          chatId: currentChat?._id
        }
        const messages = await sendMessage(data).unwrap()
        console.log("messages", messages)
        dispatch(setCurrentChatMessasges([...currentChatMessage, messages?.data]))
      } catch (error) {
        console.log(error)
      }
    }
    else if (replyMessage && isReplyOpen) {
      try {
        const data = {
          content: value,
          chatId: currentChat?._id,
          messageId: replyMessage?.message?._id
        }
        const repliedMessage = await replyMessages(data).unwrap()
        console.log("messages", repliedMessage)
        dispatch(setCurrentChatMessasges([...currentChatMessage, repliedMessage?.data]))
        dispatch(setReplyMessage(null))
        dispatch(setReplyOpen(false))
      } catch (error) {
        console.log(error)
      }
    }
    setValue("")
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessageHandler(e)
    }
  }

  const userMessageDeleteForEveryOneHandler = async () => {
    try {
      const data = {
        messageIds: selectedMessages,
        chatId: currentChat?._id
      }
      const deleteForEveryoneMeMessage = await deleteForEveryone(data).unwrap()
      const deletedChatMessages = currentChatMessage.map((msg) => {
        const index = deleteForEveryoneMeMessage?.data?.findIndex((d) => msg?.message?._id === d?.message?._id)
        if (index !== -1) {
          return { ...msg, ...deleteForEveryoneMeMessage?.data[index] }
        }
        return msg
      })
      dispatch(setCurrentChatMessasges(deletedChatMessages))
      dispatch(setSelectedMessage([]))
      dispatch(setSelectedUserMessage([]))
      dispatch(setIsSelectionOpen(false))
    } catch (error) {
      toast({ title: error?.data?.message, variant: "destructive" })
    }
  }
  const userMessageDeleteHandler = async () => {
    try {
      const data = {
        userMessageIds: selectedUserMessages
      }
      const deleteForMeMessage = await deleteForMe(data).unwrap()
      const afterDeletedChatMessages = currentChatMessage?.filter((message) => {
        if (!deleteForMeMessage?.data?.some((id) => message?._id === id)) return message
      })
      dispatch(setSelectedUserMessage([]))
      dispatch(setSelectedMessage([]))
      dispatch(setCurrentChatMessasges(afterDeletedChatMessages))
      dispatch(setIsSelectionOpen(false))
    } catch (error) {
      toast({ title: error?.data?.message, variant: "destructive" })
    }
  }
  const [isSenderONLY, setIsSenderONLY] = useState(true)
  useEffect(() => {
    const senderIS = selectedUserMessages?.every((id) => {
      const userMessage = currentChatMessage?.find((msg) => msg?._id === id)
      if (userMessage?.message?.sender?._id === user?._id && !userMessage?.message?.isDeletedBySenderToAll) return true
      else if (userMessage?.message?.sender?._id === user?._id && userMessage?.message?.isDeletedBySenderToAll) return false
      else false
    })
    setIsSenderONLY(senderIS)
    console.log("Is SenderOnly:", isSenderONLY)
  }, [selectedUserMessages, currentChatMessage, isSelectionOpen, isSenderONLY])
  return (
      <div className="">
        {currentChat && !isSelectionOpen &&
          <div className='h-full bg-zinc-900 w-full border-t-2 '>
            {isReplyOpen && <div className='flex items-center '>
              <div className='w-full bg-zinc-900 h-auto  flex justify-center items-center'>
                <div className='w-[95%] bg-zinc-800 h-[90%] rounded-lg flex overflow-hidden gap-3 mt-1 '>
                  <div><div style={{ backgroundColor: replyMessage?.message?.sender?.color }} className=' w-1 h-full '></div></div>
                  <div className=''>
                    <div style={{ color: replyMessage?.message?.sender?.color }} className='font-bold'>{replyMessage?.message?.sender?.username}</div>
                    <div className='text-gray-400 pb-3'><MessageWithEmojis message={replyMessage?.message?.content} isReplyContent={true} /></div>
                  </div>
                </div>
              </div>
              <div className='cursor-pointer hover:bg-zinc-700 mr-4 rounded-full p-1' onClick={() => {
                dispatch(setReplyMessage(null))
                dispatch(setReplyOpen(false))
              }}><IoMdClose className='h-6 w-auto ' /></div>
            </div>}
            <div className='h-16'>
              <div className=' flex  justify-evenly items-center my-auto h-full gap-5 mx-2 lg:mx-auto'>

                <div className=' flex gap-5'>
                  {/* emoji */}
                  <div className='bg-zinc-900 cursor-pointer relative ' ref={emojiPickerRef} >
                    <BsEmojiSmile className='h-9 hover:opacity-75 text-zinc-400 w-auto rounded-full  border-2  hover:bg-zinc-700' onClick={() => setShowEmoji(!showEmoji)} />
                    {showEmoji && <div className='bottom-14 left-7 absolute '>
                      <EmojiPicker
                        theme={Theme.DARK}
                        emojiStyle={EmojiStyle.FACEBOOK}
                        className="z-40"
                        onEmojiClick={(e, emoji) => {
                          console.log(e, emoji)
                          setValue((prev) => prev + e.emoji)
                        }} />
                    </div>}
                  </div>
                  {/* add attachment */}
                  <div className='bg-zinc-900 cursor-pointer '  >
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <GoLightBulb className='h-9 hover:opacity-75 text-zinc-300 w-auto rounded-full p-1 border-2  hover:bg-zinc-700' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>More Features</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem  onClick={() => navigate("/schedule")}>
                          <div className="flex gap-4 justify-center items-center h-7 cursor-pointer">
                            <div>
                              <MdOutlineScheduleSend className="h-5 w-auto" />
                            </div>
                            <div className="">
                              Schedule Message
                            </div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <div className="flex gap-4 justify-center items-center h-7">
                            <div>
                              <AiOutlineSchedule className="h-5 w-auto" />
                            </div>
                            <div className="">
                              Create Event
                            </div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <div className="flex gap-4 justify-center items-center h-7">
                            <div>
                              <MdOutlinePoll className="h-5 w-auto" />
                            </div>
                            <div className="">
                              Polling
                            </div>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className='bg-zinc-900 cursor-pointer '  >
                    <DropdownMenu>
                      <DropdownMenuTrigger><IoMdAdd className='h-9 hover:opacity-75 text-zinc-300 w-auto rounded-full p-1 border-2  hover:bg-zinc-700' /></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Media</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <div className="flex gap-4 justify-center items-center h-7">
                            <div>
                              <BsImages className="h-5 w-auto" />
                            </div>
                            <div className="">
                              Pictures
                            </div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <div className="flex gap-4 justify-center items-center h-7">
                            <div>
                              <BiSolidVideos className="h-5 w-auto" />
                            </div>
                            <div className="">
                              Videos
                            </div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <div className="flex gap-4 justify-center items-center h-7">
                            <div>
                              <PiFilesBold className="h-5 w-auto" />
                            </div>
                            <div className="">
                              Files
                            </div>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className='max-w-[70%]  w-full '>
                  <div className='w-full'>
                    <input
                      onKeyDown={handleKeyDown}
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value)
                        socket?.emit("startTyping", currentChat?._id)
                        setTimeout(() => {
                          socket?.emit("stopTyping", currentChat?._id)
                        }, 3000)
                      }
                      }
                      type="text" className=' outline-zinc-600 rounded-xl p-2 py-3 pl-5 bg-zinc-800 w-full'
                      placeholder='Type a message ' />
                  </div>
                </div>
                <div className='bg-zinc-900 cursor-pointer' onClick={sendMessageHandler}>
                  <IoSend className='h-10 hover:opacity-75 text-zinc-300 w-auto rounded-full p-1 border-2  hover:bg-zinc-700' />
                </div>
              </div>
            </div>
          </div>
        }
        {
          currentChat && isSelectionOpen &&
          <div className='h-full bg-zinc-900 w-full border-t-2 '>

            <div className='h-16'>
              <div className=' flex  justify-between items-center my-auto h-full gap-5 mx-4'>
                <div className='flex gap-5 items-center'>
                  <div className='bg-zinc-900 cursor-pointer relative ' onClick={() => {
                    dispatch(setSelectedMessage([]))
                    dispatch(setSelectedUserMessage([]))
                    dispatch(setIsSelectionOpen(false))
                  }} >
                    <IoMdClose className='h-9 hover:opacity-75 text-zinc-300 w-auto rounded-full p-1 border-2  hover:bg-zinc-700' />
                  </div>
                  <div className='font-medium text-lg'>{selectedMessages?.length || 0}<span className='ml-2'>Selected</span></div>
                </div>
                <div className=' flex gap-5'>
                  {/* emoji */}
                  <div className='bg-zinc-900 cursor-pointer relative '  >
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <MdDelete
                          className='h-9 hover:opacity-75 text-zinc-300 w-auto rounded-full p-1 border-2  hover:bg-zinc-700'
                        />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Message Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this message? This action is permanent and cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter >
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          {isSenderONLY &&
                            <AlertDialogAction
                              className="bg-red-500 text-white"
                              onClick={userMessageDeleteForEveryOneHandler}
                            >
                              Delete For Everyone
                            </AlertDialogAction>
                          }
                          <AlertDialogAction
                            className="bg-red-100"
                            onClick={userMessageDeleteHandler}>
                            Delete For Me
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  {/* add attachment */}
                  <div className='bg-zinc-900 cursor-pointer '  >
                    <FaStar className='h-9 hover:opacity-75 text-zinc-300 w-auto rounded-full p-1 border-2  hover:bg-zinc-700' />
                  </div>
                  <Dialog>
                    <DialogTrigger><div className='bg-zinc-900 cursor-pointer'>
                      <RiShareForwardFill className='h-9 hover:opacity-75 text-zinc-300 w-auto rounded-full p-1 border-2  hover:bg-zinc-700' />
                    </div></DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Forward Message To :</DialogTitle>
                        <DialogDescription>
                          <UsersList />
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
  )
}