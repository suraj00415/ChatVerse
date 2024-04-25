import { BsEmojiSmile } from 'react-icons/bs';
import { IoMdAdd } from 'react-icons/io';
import { IoSend } from "react-icons/io5";

import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useEffect, useRef, useState } from 'react';
import { useSendMessageMutation } from '@/features/messages/messageApi';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentChat } from '@/features/chat/chatSlice';
import { selectCurrentChatMessages, setCurrentChatMessasges } from '@/features/messages/messageSlice';

export default function ChatBottomBar({ socket }) {
  const [value, setValue] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)
  const emojiPickerRef = useRef(null);
  const dispatch = useDispatch()
  const currentChatMessage = useSelector(selectCurrentChatMessages)
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [sendMessage, { isLoading }] = useSendMessageMutation()

  const currentChat = useSelector(selectCurrentChat)
  const sendMessageHandler = async (e) => {
    e.preventDefault()
    const data = {
      content: value,
      chatId: currentChat?._id
    }
    const messages = await sendMessage(data).unwrap()
    console.log("messages", messages)
    dispatch(setCurrentChatMessasges([...currentChatMessage, messages?.data]))
    setValue("")
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessageHandler(e)
    }
  }
  // useEffect(() => {
  //   setTimeout(() => {
  //     socket?.emit("startTyping", currentChat?._id)
  //   }, 1000)
  // }, [value])
  return (
    <div >
      {currentChat && <div className='h-16 bg-zinc-900 w-full border-t-2  '>
        <div className='flex  justify-evenly items-center my-auto h-full gap-5 mx-2 lg:mx-auto'>

          <div className=' flex gap-5'>
            {/* emoji */}
            <div className='bg-zinc-900 cursor-pointer relative ' ref={emojiPickerRef} >
              <BsEmojiSmile className='h-9 hover:opacity-75 text-zinc-800 w-auto rounded-full p-1 border-2 border-lime-800 bg-lime-400 shadow-md' onClick={() => setShowEmoji(!showEmoji)} />
              {showEmoji && <div className='bottom-14 left-7 absolute '>
                <EmojiPicker theme='dark' emojiStyle='google' onEmojiClick={(e) => {
                  setValue((prev) => prev + e.emoji)
                }} />
              </div>}
            </div>
            {/* add attachment */}
            <div className='bg-zinc-900 cursor-pointer '  >
              <IoMdAdd className='h-9 hover:opacity-75 text-zinc-800 w-auto rounded-full p-1 border-2 border-lime-800 bg-lime-400 shadow-md' />
            </div>
          </div>
          <div className='max-w-[70%]  w-full '>
            <div className='w-full'>
              <input onKeyDown={handleKeyDown} value={value} onChange={(e) => {
                setValue(e.target.value)
                socket?.emit("startTyping", currentChat?._id)
                setTimeout(() => {
                  socket?.emit("stopTyping", currentChat?._id)
                }, 3000)
              }
              }
                type="text" className=' outline-zinc-600 rounded-xl p-2 py-3 pl-5 bg-zinc-800 w-full' placeholder='Enter the text message ' />
            </div>
          </div>
          <div className='bg-zinc-900 cursor-pointer' onClick={sendMessageHandler}>
            <IoSend className='h-9 hover:opacity-75 text-zinc-800 w-auto rounded-full p-1 border-2 border-lime-800 bg-lime-400 shadow-md' />
          </div>
        </div>
      </div>}
    </div>
  )
}