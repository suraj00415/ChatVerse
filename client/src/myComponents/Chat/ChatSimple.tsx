import {
    Dialog,
    DialogContent,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { setReplyMessage, setReplyOpen } from '@/features/messages/messageSlice';
import EmojiPicker, { Emoji, EmojiStyle, Theme } from "emoji-picker-react";
import moment from 'moment';
import { memo, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { TiArrowForward } from "react-icons/ti";
import { useDispatch } from 'react-redux';
import { MessageWithEmojis } from "./MessageWithEmoji";
import { MdDoDisturbAlt } from "react-icons/md";

const Reaction = ({ message }) => {
    return (
        <>
            <div className="flex flex-col gap-2">
                <div>Messasge:</div>
                <div className="bg-zinc-800 p-2 rounded-md">
                    <MessageWithEmojis message={message} isReplyContent={true} />
                </div>
                <EmojiPicker
                    allowExpandReactions={false}
                    onReactionClick={(emoji, e) => {
                        console.log("Emoji:", emoji);
                        console.log("E:", e);
                    }}
                    reactionsDefaultOpen={true}
                    open={true}
                    theme={Theme.DARK}
                    emojiStyle={EmojiStyle.FACEBOOK}
                />
            </div>
            Reactions:
            <ScrollArea className="h-[250px] rounded-md border p-4 ">
                <div className="flex flex-col gap-2">
                    {
                        dummyUserReactionData.map((user) => <div className=' bg-zinc-800 cursor-pointer rounded-lg p-2 flex justify-between items-center hover:bg-zinc-700' key={1}>
                            <div className='flex gap-2 justify-between w-full'>
                                <div className="flex gap-2 items-center">
                                    <div><img src={user.url} className='h-12 rounded-full' alt="" /></div>
                                    <div>
                                        <div className='font-semibold'>{user.name}</div>
                                        <div className=''><span className='text-lime-400'>@</span>{user.username}</div>
                                    </div>
                                </div>
                                <Emoji unified={user?.emojiCode} size={24} emojiStyle={EmojiStyle.FACEBOOK} />
                            </div>
                        </div>)
                    }
                </div>
            </ScrollArea>
        </>
    )
}
const dummyUserReactionData = [
    {
        url: "https://res.cloudinary.com/dfu2zsjpw/image/upload/v1713139977/bumatx1ubguktva8y3vj.jpg",
        name: "Manish Shah",
        username: "manish",
        emojiCode: "1f44d"
    },
    {
        url: "https://res.cloudinary.com/dfu2zsjpw/image/upload/v1713139977/bumatx1ubguktva8y3vj.jpg",
        name: "Suraj Shah",
        username: "suraj",
        emojiCode: "2764-fe0f"
    },
    {
        url: "https://res.cloudinary.com/dfu2zsjpw/image/upload/v1713139977/bumatx1ubguktva8y3vj.jpg",
        name: "Manish Shah",
        username: "manish",
        emojiCode: "1f44d"
    },
    {
        url: "https://res.cloudinary.com/dfu2zsjpw/image/upload/v1713139977/bumatx1ubguktva8y3vj.jpg",
        name: "Manish Shah",
        username: "manish",
        emojiCode: "1f44d"
    },
    {
        url: "https://res.cloudinary.com/dfu2zsjpw/image/upload/v1713139977/bumatx1ubguktva8y3vj.jpg",
        name: "Manish Shah",
        username: "manish",
        emojiCode: "1f44d"
    },
    {
        url: "https://res.cloudinary.com/dfu2zsjpw/image/upload/v1713139977/bumatx1ubguktva8y3vj.jpg",
        name: "Manish Shah",
        username: "manish",
        emojiCode: "1f44d"
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
    const [isMainDropDownOpen, setIsMainDropDownOpen] = useState(false)

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
                    {!messageData?.message?.isDeleted && <MessageWithEmojis message={message} isSmall={false} />}
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
                    <div className='cursor-pointer'>
                        <Dialog>
                            <DropdownMenu onOpenChange={(open) => setIsMainDropDownOpen(open)} open={isMainDropDownOpen}>
                                <DropdownMenuTrigger className=''><FaChevronDown className='h-3 text-gray-400' /></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {!messageData?.message?.isDeletedBySenderToAll &&
                                        <>
                                            <DropdownMenuItem onClick={() => replyHandler(messageData)} className="cursor-pointer">Reply</DropdownMenuItem>
                                            <DropdownMenuItem >
                                                <DialogTrigger className="w-full text-start">
                                                    React
                                                </DialogTrigger>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Message Info</DropdownMenuItem>
                                            <DropdownMenuItem>Star</DropdownMenuItem>
                                            <DropdownMenuItem>Forward</DropdownMenuItem>
                                        </>
                                    }
                                    <DropdownMenuItem>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DialogContent >
                                <Reaction message={message} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
            {Math.round(Math.random()) === 1 && !messageData?.message?.isDeletedBySenderToAll &&
                <Dialog>
                    <DialogTrigger>
                        <div className={`${isSender ? "right-2" : ""} absolute -bottom-3 z-10`} >
                            <div className="bg-zinc-500 hover:bg-zinc-400 rounded-full p-1 cursor-pointer">
                                <Emoji unified="1f44d" size={14} emojiStyle={EmojiStyle.FACEBOOK}/>
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent >
                        <Reaction message={message} />
                    </DialogContent>
                </Dialog>
            }
        </div>
    )
}

export default memo(ChatSimple)