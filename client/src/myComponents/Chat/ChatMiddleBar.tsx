import { selectCurrentUser } from '@/features/auth/authSlice';
import { selectCurrentChat } from '@/features/chat/chatSlice';
import { selectCurrentChatMessages, selectIsReplyOpen, selectIsSelectionOpen, selectSelectedMessage, selectSelectedUserMessage, setSelectedMessage, setSelectedUserMessage } from '@/features/messages/messageSlice';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CheckboxComponent from '../Checkbox/CheckboxComponent';
import ChatImage from './ChatImage';
import ChatSimple from './ChatSimple';
import "./opacity.css";
import Spinners from './Spinners';
import chatFiller from '/assets/chatting-33.svg';
import chatFiller2 from '/assets/conversation-13.svg';
import ChatPolling from './ChatPolling';



export default function ChatMiddleBar({ isMessageLoading, isMessageFetching }) {
  const currentChatMessage = useSelector(selectCurrentChatMessages);
  const user = useSelector(selectCurrentUser);
  const currentChat = useSelector(selectCurrentChat);
  const isSelectionOpen = useSelector(selectIsSelectionOpen);
  const scrollMessageRef = useRef(null);
  const isReplyOpen = useSelector(selectIsReplyOpen);
  const dispatch = useDispatch();
  const selectedMessages = useSelector(selectSelectedMessage);
  const selectedUserMessages = useSelector(selectSelectedUserMessage)
  let messageDate = "";
  let prevSender = "";

  useEffect(() => {
    scrollToBottom();
  }, [currentChatMessage, isMessageFetching, isReplyOpen]);

  const scrollToBottom = useCallback(() => {
    if (scrollMessageRef.current) {
      scrollMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollMessageRef]);

  const formatDate = useCallback((date) => {
    console.log("Format Called")
    const mongoDate = new Date(date);
    const dates = moment(mongoDate).format('DD/MM/YYYY');
    const nowDate = moment(new Date(Date.now())).format('DD/MM/YYYY');
    const yesterdayDate = moment(new Date(Date.now() - (24 * 60 * 60 * 1000))).format('DD/MM/YYYY');
    if (dates === nowDate) return "Today";
    if (dates === yesterdayDate) return "Yesterday";
    return dates;
  }, []);

  const toggleCheckbox = useCallback((e, messageId, userMessageId) => {
    e.stopPropagation();
    console.log("Toggle Called")
    const isChecked = selectedMessages.includes(messageId);
    if (isChecked) {
      dispatch(setSelectedMessage(selectedMessages.filter(msg => msg !== messageId)));
      dispatch(setSelectedUserMessage(selectedUserMessages.filter(msg => msg !== userMessageId)));
    } else {
      dispatch(setSelectedMessage([...selectedMessages, messageId]));
      dispatch(setSelectedUserMessage([...selectedUserMessages, userMessageId]));
    }
  }, [selectedMessages, selectedUserMessages, dispatch]);

  const formattedMessages = useMemo(() => {
    return currentChatMessage?.map(data => ({
      ...data,
      formattedDate: formatDate(data?.message?.createdAt),
    }));
  }, [currentChatMessage, formatDate]);

  const renderMessage = useMemo(() => {
    console.log("render")
    return formattedMessages?.map((data, i) => {
      const isSender = data?.message?.sender?._id === user?._id;
      const newDate = data?.formattedDate !== messageDate;
      if (newDate) messageDate = data?.formattedDate;
      const isPrevSender = prevSender === data?.message?.sender?._id;
      if (!isPrevSender) prevSender = data?.message?.sender?._id;
      const checkHandler = selectedMessages.includes(data?.message?._id);
      return (
        <div key={data?.message?._id}>
          {newDate && (
            <div className='flex justify-center sticky top-3 my-2 mt-4 z-20'>
              <div className='bg-zinc-800 flex justify-center py-1 w-[40%] sm:w-[27%] md:w-[20%] lg:w-[15%] xl:w-[10%] rounded-lg text-lime-400 text-sm font-medium border border-zinc-700'>
                {data?.formattedDate}
              </div>
            </div>
          )}
          <div
            className={`${isSelectionOpen ? "cursor-pointer pr-2" : ""} flex items-center mt-1 rounded-lg`}
            style={{ backgroundColor: isSelectionOpen && selectedMessages.includes(data?.message?._id) ? "rgba(106, 109, 122, 0.42)" : "" }}
            onClick={(e) => { isSelectionOpen && toggleCheckbox(e, data?.message?._id, data?._id) }}
            onMouseEnter={(e) => { if (isSelectionOpen) { e.currentTarget.classList.add('backGroundOp', 'opacity-80'); } }}
            onMouseLeave={(e) => { if (isSelectionOpen) { e.currentTarget.classList.remove('backGroundOp', 'opacity-80'); } }}
            ref={i === formattedMessages?.length - 1 ? scrollMessageRef : null}
          >
            {isSelectionOpen && (
              <div className='ml-1'>
                <CheckboxComponent checkHandler={checkHandler} />
              </div>
            )}
            <div className={`${isPrevSender && !newDate ? "" : "mt-3"} w-full`}>
              <div className='flex flex-col'>
                <div className={`${isSender ? 'self-end' : 'self-start'}`} key={data?.message?._id + 2}>
                  {data?.message?.attachments && data?.message?.attachments?.length == 0 &&
                    <ChatSimple
                      isForwarded={data?.message?.isForwarded}
                      message={data?.message?.content}
                      isSender={isSender}
                      isGroup={currentChat?.isGroup}
                      senderName={data?.message?.sender?.username}
                      timeAgo={data?.message?.createdAt}
                      newDate={newDate}
                      isPrevSender={isPrevSender && !newDate}
                      color={data?.message?.sender?.color}
                      messageData={data}
                      isReply={data?.message?.isReply || false}
                      replyToName={data?.message?.replyTo?.sender?.username || ""}
                      replyToColor={data?.message?.replyTo?.sender?.color || ""}
                      replyToContent={data?.message?.replyTo?.content || ""}
                    />}
                  {data?.message?.attachments && data?.message?.attachments?.length > 0 &&
                    <ChatImage
                      isForwarded={data?.message?.isForwarded}
                      message={data?.message?.content}
                      isSender={isSender}
                      isGroup={currentChat?.isGroup}
                      senderName={data?.message?.sender?.username}
                      timeAgo={data?.message?.createdAt}
                      newDate={newDate}
                      isPrevSender={isPrevSender && !newDate}
                      color={data?.message?.sender?.color}
                      messageData={data?.message}
                      isReply={data?.message?.isReply || false}
                      replyToName={data?.message?.replyTo?.sender?.username || ""}
                      replyToColor={data?.message?.replyTo?.sender?.color || ""}
                      replyToContent={data?.message?.replyTo?.content || ""}
                      images={data?.message?.attachments}
                    />
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }, [formattedMessages, isSelectionOpen, selectedMessages, prevSender]);

  return (
    <>
      <div className='max-w-full w-full relative'>
        <div className='h-screen w-full fixed bg-contain top-0 -z-20 bg-[url("/assets/back5.png")] opacity-10 bg-repeat-x'></div>
        <div className='px-4 mt-3'>
          {!isMessageFetching && !isMessageLoading && currentChatMessage && currentChat && !currentChatMessage?.length &&
            <div className='w-full mt-20 flex justify-center'>
              <div className='flex flex-col justify-center items-center gap-10'>
                <img src={chatFiller} alt="" className='h-76 w-auto' />
                <div className='text-2xl font-extrabold'>
                  Start New Chat By Typing!
                </div>
              </div>
            </div>
          }
          <div className='mb-2'>
            {!isMessageFetching && !isMessageLoading && currentChatMessage && currentChatMessage?.length > 0 && renderMessage}
            {isMessageFetching && <Spinners />}
            {/* <ChatPolling /> */}
          </div>
        </div>
      </div>
      {!currentChat && !currentChat?.length && (
        <div className='flex flex-col justify-center items-center gap-10'>
          <div className='flex justify-center items-center mt-16'>
            <img src="/assets/Blender/ChatVerseLogo2.png" className='h-28 w-auto' alt="" />
            <img src="./assets/Blender/logoChat2.png" className="h-20 w-auto  " alt="" />
          </div>
          <img src={chatFiller2} alt="" className='h-96 w-auto' />
        </div>
      )}
    </>
  );
}
