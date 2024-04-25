import { selectCurrentUser } from '@/features/auth/authSlice'
import { selectCurrentChat } from '@/features/chat/chatSlice'
import { selectCurrentChatMessages } from '@/features/messages/messageSlice'
import moment from 'moment'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import chatFiller from '/assets/chatting-33.svg'
import chatFiller2 from '/assets/conversation-13.svg'
import ChatSimple from './ChatSimple'
import Spinners from './Spinners'
export default function ChatMiddleBar({ isMessageLoading, isMessageFetching }) {
  useEffect(() => {
    console.log("Message Loading", isMessageLoading)
  }, [isMessageLoading])
  const currentChatMessage = useSelector(selectCurrentChatMessages)
  const user = useSelector(selectCurrentUser)
  const currentChat = useSelector(selectCurrentChat)
  const scrollMessasgeRef = useRef(null)
  let messageDate = ""
  let prevSender = ""

  useEffect(() => {
    scrollToBottom();
  }, [currentChatMessage, isMessageFetching]);

  const scrollToBottom = () => {
    if (scrollMessasgeRef.current) {
      scrollMessasgeRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const formatDate = (date) => {
    const mongoDate = new Date(date)
    const dates = moment(mongoDate).format('LL')
    const nowDate = moment(new Date(Date.now())).format('LL')
    const yesterdayDate = moment(new Date(Date.now() - (24 * 60 * 60 * 1000))).format('LL')
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
          <div className=' mb-2'>
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
                return (
                  <>
                    {newDate && (
                      <div className='flex justify-center sticky top-3' key={data?._id + "abc"}>
                        <div className='bg-zinc-800 flex justify-center py-1 w-[40%] sm:w-[30%]  lg:w-[20%] xl:w-[15%] rounded-3xl text-lime-400 text-sm font-medium border border-zinc-700 '>
                          {messageDate}
                        </div>
                      </div>
                    )}
                    <div
                      key={data?._id}
                      className={`${isPrevSender && !newDate ? "mt-1" : "mt-5"}  w-full`}>
                      <div className='flex flex-col'>
                        <div className={`${isSender ? 'self-end' : 'self-start'}`}>
                          <ChatSimple
                            message={data?.content}
                            isSender={isSender}
                            isGroup={currentChat?.isGroup}
                            senderName={data?.sender?.username}
                            timeAgo={data?.createdAt}
                            newDate={newDate}
                            isPrevSender={isPrevSender && !newDate}
                          />
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
            <div ref={scrollMessasgeRef} />
          </div>
        </div>
      </div>
      {
        !currentChat && !currentChat?.length &&
        (
          <div className='flex flex-col justify-center items-center gap-10'>
            <div className='flex justify-center items-center mt-20 text-4xl font-bold'>
              Welcome To ChatVerse
            </div>
            <img src={chatFiller2} alt="" className='h-96 w-auto' />
          </div>
        )
      }
    </>
  )
}
