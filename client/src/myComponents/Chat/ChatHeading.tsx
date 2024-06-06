import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { selectUnreadMessage, setFilterUnreadMessge } from "@/features/messages/messageSlice";
import { IoMdArrowDropdown } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { MessageWithEmojis } from "./MessageWithEmoji";


export default function ChatHeading({ imageSrc, name, message, message_person_name, msgTime, messageCount, chatId }) {
    const unreadMessage = useSelector(selectUnreadMessage)
    // const currentChat = useSelector(selectCurrentChat) 
    const dispatch = useDispatch()
    const filterUnreadMessgeHandler = (chatId) => {
        const filteredUnreadMessage = unreadMessage?.filter((uread) => {
            if (uread?.chat !== chatId) return uread
        })
        dispatch(setFilterUnreadMessge(filteredUnreadMessage))
    }

    return (
        chatId && name &&
        (<div className='max-w-[420px] w-full cursor-pointer hover:bg-zinc-800 pr-2' onClick={() => filterUnreadMessgeHandler(chatId)}>
            <div className='p-1  flex gap-4 rounded-lg '>
                <div className='m-2'>
                    <div  className="h-[55px] justify-center items-center flex">
                        <img className='w-[75px] h-auto rounded-full' src={imageSrc} alt="" />
                    </div>
                </div>
                <div className='flex w-full items-center justify-between'>
                    <div>
                        {/* desc names,msg */}
                        {/* name */}
                        <div className='font-bold text-lg'>{name}</div>
                        {/* msg */}
                        <div className='flex gap-1 '>
                            {message_person_name && <div className="">{message_person_name?.length > 12 ?message_person_name?.substring(0,12) +"..": message_person_name}</div>}
                            {message_person_name && <div>:</div>}
                            {/* {message_person_name && message && <div className="">{message?.length > 20 ? message?.substring(0, 20) + "..." : message}</div>} */}
                            {message_person_name && message && <div className=""><MessageWithEmojis message={message} isHeading={true} isSmall={true}/></div>}
                            {!message_person_name && !message && <div>No New Message To Display</div>}
                        </div>
                    </div>
                    <div className='flex flex-col gap-1'>
                        {/* time ,notifiy,mute */}
                        <div className='text-sm truncate '>
                            {/* time */}
                            {msgTime}
                        </div>
                        <div className='w-full flex justify-center items-center gap-2'>
                            {/* notify */}
                            {messageCount > 0 && <div className='w-[50%]'>
                                <div className='text-center text-xs p-1 font-bold text-black bg-lime-400 rounded-full'>
                                    {messageCount}
                                </div>
                            </div>}
                            {/* mute */}
                            <div><DropdownMenu>
                                <DropdownMenuTrigger className='rounded-full'>
                                    <div>
                                        <IoMdArrowDropdown className=' h-7 w-full hover:bg-zinc-500 hover:rounded-full ' />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Billing</DropdownMenuItem>
                                    <DropdownMenuItem>Team</DropdownMenuItem>
                                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='h-[1px] bg-zinc-800 w-full'></div>
        </div>)
    )
}
