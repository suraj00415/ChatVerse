import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { setReplyMessage, setReplyOpen } from '@/features/messages/messageSlice';
import moment from 'moment';
import { memo, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { GrFormCheckmark } from "react-icons/gr";
import { IoCheckmarkDone, IoCheckmarkDoneSharp, IoCheckmarkOutline } from "react-icons/io5";
import { MdDoDisturbAlt } from "react-icons/md";
import { TiArrowForward } from "react-icons/ti";
import { useDispatch } from 'react-redux';
import { MessageWithEmojis } from "./MessageWithEmoji";
import UsersRead_Unread_Sent from "./UsersRead_Unread_Sent";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";


const pollingData = [
    {
        title: "Bunk Lecture (Yes)",
        votePercent: 50,
        isVoted: true,
    },
    {
        title: "No",
        votePercent: 30,
        isVoted: false,
    },
    {
        title: "Will Go But Vote For Yes",
        votePercent: 3,
        isVoted: false,
    },
]


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
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    return (
        <div className={`bg-zinc-800  p-1 px-2 relative text-white ${isSender ? isPrevSender ? "rounded-2xl" : " rounded-tl-2xl   rounded-tr-sm" : isPrevSender ? "rounded-2xl" : "rounded-tr-2xl rounded-tl-sm"} ${isPrevSender ? "rounded-2xl" : "rounded-b-2xl  "} max-w-[200px] sm:max-w-[280px] md:max-w-[400px] lg:max-w-[450px]  flex flex-col  justify-center`}>
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
            <div className={`w-full p-2 `} >
                <div className="flex flex-col gap-3">
                    {
                        pollingData?.map((d) => {
                            return (
                                <div className="cursor-pointer bg-zinc-700 p-3 rounded-lg hover:bg-zinc-900">
                                    <div className="flex justify-start w-full items-center gap-2">
                                        {d.isVoted ? <IoMdCheckmarkCircle className={`text-lime-400 h-5 w-auto`} /> :
                                            <IoIosCheckmarkCircleOutline className={`h-5 w-auto`} />}
                                        <div className="flex gap-3 justify-between w-full">
                                            <div>
                                                {d.title}
                                            </div>
                                            <div className="font-semibold text-sm">{d.votePercent}</div>
                                        </div>
                                    </div>
                                    <div className="relative mt-1">
                                        <div style={{ width: `${d.votePercent}%` }} className={`rounded-lg h-1 z-40 absolute top-0 left-0 bg-lime-400`}></div>
                                        <div className={`h-1 w-full bg-zinc-500 rounded-lg absolute top-0 left-0 z-10`}></div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="w-full bg-zinc-700 p-1 hover:bg-zinc-900 cursor-pointer font-semibold text-center rounded-lg mt-2">View Votes</div>
                <div className='w-max-[450px] '>
                    {messageData?.message?.isDeletedBySenderToAll &&
                        <div className="text-zinc-500 flex items-center gap-2 italic font-medium">
                            <MdDoDisturbAlt className="h-5 w-auto" />
                            {messageData?.message?.deletedAlert}
                        </div>
                    }
                    {message?.length > 30 && <div className='text-nowrap text-gray-400 font-medium opacity-85 '>
                        {timeAgo && <div className='text-[13px]'>{formatTime(timeAgo)}</div>}
                    </div>}
                </div>

                <div className="flex items-center gap-1">

                    {message?.length <= 30 && <div className='text-nowrap text-gray-400 font-medium opacity-85 '>
                        {timeAgo && <div className='text-[13px]'>{formatTime(timeAgo)}</div>}
                    </div>}
                    {isSender && messageData?.message?.unread?.length === 0 && <IoCheckmarkDoneSharp className="text-lime-300 h-5 w-auto" />}
                    {isSender && messageData?.message?.sent?.length > 0 && messageData?.message?.unread?.length !== 0 && <IoCheckmarkDoneSharp className="text-zinc-400 h-5 w-auto" />}
                    {isSender && messageData?.message?.unread?.length > 0 && messageData?.message?.read?.length === 0 && messageData?.message?.sent?.length === 0 && <GrFormCheckmark className="text-zinc-400 h-6 w-auto" />}
                    <div className='cursor-pointer'>
                        <DropdownMenu>
                            <DropdownMenuTrigger><FaChevronDown className='h-3 text-gray-400' /></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {!messageData?.message?.isDeletedBySenderToAll &&
                                    <>
                                        <DropdownMenuItem onClick={() => replyHandler(messageData)} className="cursor-pointer">Reply</DropdownMenuItem>
                                        {isSender && <DropdownMenuItem onClick={() => setIsSheetOpen(true)}>Message Info</DropdownMenuItem>}
                                        <DropdownMenuItem>Star</DropdownMenuItem>
                                        <DropdownMenuItem>Forward</DropdownMenuItem>
                                    </>
                                }
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetContent className="overflow-y-scroll">
                        <SheetHeader>
                            <SheetTitle>Message Info</SheetTitle>
                            <SheetHeader>
                                <div className="flex items-center gap-3">
                                    <div>
                                        Read
                                    </div>
                                    <div>
                                        <IoCheckmarkDone className="text-lime-300 h-5 w-auto" />
                                    </div>
                                </div>
                            </SheetHeader>
                            <UsersRead_Unread_Sent MessageForNoParticipants={"No One Has Read The Message"} messageData={messageData?.message?.read} />
                            <SheetHeader>
                                <div className="flex items-center gap-3">
                                    <div>
                                        Delivered
                                    </div>
                                    <div>
                                        <IoCheckmarkDone className="h-5 w-auto" />
                                    </div>
                                </div>
                            </SheetHeader>
                            <UsersRead_Unread_Sent MessageForNoParticipants={"Message is not sent to anyone"} messageData={messageData?.message?.sent} />
                            <SheetHeader><div className="flex items-center gap-2">
                                <div>
                                    Unread
                                </div>
                                <div>
                                    <IoCheckmarkOutline className="h-5 w-auto" />
                                </div>
                            </div>
                            </SheetHeader>
                            <UsersRead_Unread_Sent isTimeShow={false} MessageForNoParticipants={"Everyone Has Read The Message"} messageData={messageData?.message?.unread} />
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
            </div>
        </div >
    )
}

export default memo(ChatSimple)