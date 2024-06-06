import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setReplyMessage, setReplyOpen } from '@/features/messages/messageSlice';
import moment from 'moment';
import { FaChevronDown } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { TiArrowForward } from "react-icons/ti";
import { memo } from "react";
import { MessageWithEmojis } from "./MessageWithEmoji";


const ChatSimple = function ({ isForwarded, message, isSender, isGroup, senderName, timeAgo, newDate, isPrevSender, color, messageData, replyToContent, replyToColor, replyToName, isReply }) {
    const dispatch = useDispatch()
    const replyHandler = (data) => {
        dispatch(setReplyMessage(data))
        dispatch(setReplyOpen(true))
    }
    const formatTime = (time) => {
        const mongoDate = new Date(time)
        const timeInLT = moment(mongoDate).format('LT')
        return timeInLT
    }

    return (
        <div
            className={`bg-zinc-800  p-1 px-2 relative text-white ${isSender ? isPrevSender ? "rounded-2xl" : " rounded-tl-2xl   rounded-tr-sm" : isPrevSender ? "rounded-2xl" : "rounded-tr-2xl rounded-tl-sm"} ${isPrevSender ? "rounded-2xl" : "rounded-b-2xl  "} max-w-[200px] sm:max-w-[280px] md:max-w-[400px] lg:max-w-[600px]  flex flex-col  justify-center`}>
            {isGroup && !isPrevSender && !isSender && (<div style={{ color: color }} className={`font-bold`}>{"~" + senderName}</div>)}
            {isForwarded && (<div className="flex items-center gap-1 text-gray-400 text-sm">
                <div>
                    <TiArrowForward className="h-6" />
                </div>
                <div>Forwarded</div>
            </div>)}
            {isReply && <div className="flex bg-zinc-900 rounded-xl overflow-hidden cursor-default">
                <div style={{ backgroundColor: replyToColor, color: replyToColor }} className="h-auto w-1 select-none">.</div>
                <div>
                    <div style={{ color: replyToColor }} className=" px-3 font-bold ">{"~" + replyToName}</div>
                    <div className=" px-3 text-gray-400 text-[0.92rem]" style={{ wordBreak: "break-word" }}><MessageWithEmojis message={replyToContent} isReplyContent={true} /> </div>
                </div>
            </div>}
            <div className={`flex justify-between items-end gap-2 p-1`} >
                <div className='w-max-[450px] '>
                    <MessageWithEmojis message={message} isSmall={false} />
                    {message?.length > 30 && <div className='text-nowrap text-gray-400 font-medium opacity-85 '>
                        {timeAgo && <div className='text-[13px]'>{formatTime(timeAgo)}</div>}
                    </div>}
                </div>
                <div className="flex items-center gap-1">
                    {message?.length <= 30 && <div className='text-nowrap text-gray-400 font-medium opacity-85 '>
                        {timeAgo && <div className='text-[13px]'>{formatTime(timeAgo)}</div>}
                    </div>}
                    <div className='cursor-pointer'>
                        <DropdownMenu>
                            <DropdownMenuTrigger className=''><FaChevronDown className='h-3 text-gray-400' /></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => replyHandler(messageData)}>Reply</DropdownMenuItem>
                                <DropdownMenuItem>Billing</DropdownMenuItem>
                                <DropdownMenuItem>Team</DropdownMenuItem>
                                <DropdownMenuItem>Subscription</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(ChatSimple)