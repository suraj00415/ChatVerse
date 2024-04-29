import { selectCurrentUser } from '@/features/auth/authSlice'
import { selectCurrentChat } from '@/features/chat/chatSlice'
import { selectCurrentChatMessages, selectIsReplyOpen, selectIsSelectionOpen, selectSelectedMessage, setSelectedMessage } from '@/features/messages/messageSlice'
import moment from 'moment'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ChatSimple from './ChatSimple'
import Spinners from './Spinners'
import chatFiller from '/assets/chatting-33.svg'
import chatFiller2 from '/assets/conversation-13.svg'
import CheckboxComponent from '../Checkbox/CheckboxComponent'
import "./opacity.css"

export default function ChatMiddleBar({ isMessageLoading, isMessageFetching }) {
  useEffect(() => {
    console.log("Message Loading", isMessageLoading)
  }, [isMessageLoading])
  const currentChatMessage = useSelector(selectCurrentChatMessages)
  const user = useSelector(selectCurrentUser)
  const currentChat = useSelector(selectCurrentChat)
  const isSelectionOpen = useSelector(selectIsSelectionOpen)
  const scrollMessasgeRef = useRef(null)
  let messageDate = ""
  let prevSender = ""
  const isReplyOpen = useSelector(selectIsReplyOpen)
  const dispatch = useDispatch()
  const selectedMessages = useSelector(selectSelectedMessage)
  useEffect(() => {
    scrollToBottom();

  }, [currentChatMessage, isMessageFetching, isReplyOpen]);

  const scrollToBottom = () => {
    if (scrollMessasgeRef.current) {
      scrollMessasgeRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const formatDate = (date) => {
    const mongoDate = new Date(date)
    const dates = moment(mongoDate).format('DD/MM/YYYY')
    const nowDate = moment(new Date(Date.now())).format('DD/MM/YYYY')
    const yesterdayDate = moment(new Date(Date.now() - (24 * 60 * 60 * 1000))).format('DD/MM/YYYY')
    if (dates === nowDate) return "Today"
    if (dates === yesterdayDate) return "Yesterday"
    return dates
  }
  return (
    <>
      <div className='max-w-full w-full relative'>
        <div className=' h-screen w-full fixed bg-contain top-0 -z-20 bg-[url("/assets/back5.png")] opacity-10 bg-repeat-x ' ></div>
        <div className='px-4 mt-3'>
          {
            !isMessageFetching && !isMessageLoading && currentChatMessage && currentChat && !currentChatMessage?.length && <div className='w-full mt-20 flex justify-center '>
              <div className='flex flex-col justify-center items-center gap-10'>
                <img src={chatFiller} alt="" className='h-76 w-auto' />
                <div className='text-2xl font-extrabold'>
                  Start New Chat By Typing!
                </div>
              </div>
            </div>
          }
          <div className='mb-2'>
            {
              !isMessageFetching && !isMessageLoading && currentChatMessage && currentChatMessage?.length > 0 && currentChatMessage?.map((data, i) => {
                let isSender = false
                if (data?.sender?._id === user?._id) {
                  isSender = true
                }
                let newDate = false
                if (formatDate(data?.createdAt) !== messageDate) {
                  messageDate = formatDate(data?.createdAt)
                  newDate = true
                }
                let isPrevSender = false
                if (prevSender === data?.sender?._id) {
                  isPrevSender = true
                }
                else if (prevSender !== data?.sender?._id) {
                  prevSender = data?.sender?._id
                }
                const toggleCheckbox = (e) => {
                  e.stopPropagation();
                  const messageId = data?._id;
                  const isChecked = selectedMessages.includes(messageId);
                  if (isChecked) {
                    const filteredMessages = selectedMessages.filter(msg => msg !== messageId);
                    dispatch(setSelectedMessage(filteredMessages));
                  } else {
                    dispatch(setSelectedMessage([...selectedMessages, messageId]));
                  }
                };
                let checkHandler = selectedMessages.includes(data?._id)
                return (
                  <>
                    {newDate && (
                      <div className={`flex justify-center sticky top-3 my-2 z-20`} key={data?._id + "abc"} >
                        <div className='bg-zinc-800 flex justify-center py-1 w-[40%] sm:w-[27%] md:w-[20%] lg:w-[15%] xl:w-[10%] rounded-lg text-lime-400 text-sm font-medium border border-zinc-700 '>
                          {messageDate}
                        </div>
                      </div>
                    )}
                    <div
                      style={{ backgroundColor: `${isSelectionOpen && selectedMessages.includes(data?._id) ? "rgba(106, 109, 122, 0.42)" : ""}` }}
                      className={` ${isSelectionOpen ? "cursor-pointer" : ""} flex  items-center mt-1 rounded-lg `}
                      onClick={toggleCheckbox}
                      onMouseEnter={(e) => { if (isSelectionOpen) { e.currentTarget.classList.add('backGroundOp', 'opacity-80'); } }}
                      onMouseLeave={(e) => { if (isSelectionOpen) { e.currentTarget.classList.remove('backGroundOp', 'opacity-80'); } }}
                    >
                      {isSelectionOpen && <div className='ml-1'>
                        <CheckboxComponent checkHandler={checkHandler} />
                      </div>}

                      <div
                        key={data?._id}
                        className={`${isPrevSender && !newDate ? "" : "mt-2"}  w-full `}>
                        <div className='flex flex-col '>
                          <div className={`${isSender ? 'self-end' : 'self-start'}`}>
                            <ChatSimple
                              message={data?.content}
                              isSender={isSender}
                              isGroup={currentChat?.isGroup}
                              senderName={data?.sender?.username}
                              timeAgo={data?.createdAt}
                              newDate={newDate}
                              isPrevSender={isPrevSender && !newDate}
                              color={data?.sender?.color}
                              messageData={data}
                              isReply={data?.isReply || false}
                              replyToName={data?.replyTo?.sender?.username || ""}
                              replyToColor={data?.replyTo?.sender?.color || ""}
                              replyToContent={data?.replyTo?.content || ""}
                            />
                          </div>
                        </div>
                      </div>
                    </div>


                  </>
                )
              })
            }
            {
              isMessageFetching && <Spinners />
            }
          </div>
        </div>
      </div>
      <div ref={scrollMessasgeRef} ></div>
      {
        !currentChat && !currentChat?.length &&
        (
          <div className='flex flex-col justify-center items-center gap-10'>
            <div className='flex justify-center items-center mt-20 text-4xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent'>
              Welcome To ChatVerse
            </div>
            <img src={chatFiller2} alt="" className='h-96 w-auto' />
          </div>
        )
      }
    </>
  )
}
