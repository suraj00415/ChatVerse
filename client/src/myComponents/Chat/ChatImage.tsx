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
import { memo, useState } from "react";
import 'react-photo-view/dist/react-photo-view.css';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { FaArrowRotateRight } from "react-icons/fa6";
import { MdOutlineZoomIn } from "react-icons/md";
import { MdOutlineZoomOut } from "react-icons/md";
import { MdFileDownload } from "react-icons/md";

const ChatSimple = function ({ images, isForwarded, message, isSender, isGroup, senderName, timeAgo, newDate, isPrevSender, color, messageData, replyToContent, replyToColor, replyToName, isReply }) {

    const URL_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
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
    const TextMessageHyperLink = (message) => {
        let words = message?.message?.split(' ')
        return (
            <div style={{ wordBreak: "break-word" }} >
                {words.map((word) => {
                    return word.match(URL_REGEX) ? (
                        <>
                            <a target='_blank' className='text-sky-400 ' href={word}>{word}</a>{' '}
                        </>
                    ) : (
                        word + ' '
                    );
                })}
            </div>
        );
    }
    const [imageIndex, setImageIndex] = useState<Number>(0)

    let imageItem = ""
    return (
        <div className={`bg-zinc-800  p-1 px-2 relative text-white ${isSender ? isPrevSender ? "rounded-2xl" : " rounded-tl-2xl   rounded-tr-sm" : isPrevSender ? "rounded-2xl" : "rounded-tr-2xl rounded-tl-sm"} ${isPrevSender ? "rounded-2xl" : "rounded-b-2xl  "} max-w-[200px] sm:max-w-[280px] md:max-w-[300px] lg:max-w-[320px]  flex flex-col  justify-center`}>
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
                    <div className=" px-3 text-gray-400 text-[0.92rem]" style={{ wordBreak: "break-word" }}>{replyToContent?.length > 250 ? replyToContent?.substring(0, 250) + "........" : replyToContent} </div>
                </div>
            </div>}
            <div className={`flex flex-col p-1`} >
                <div className='flex'>
                    <PhotoProvider maskOpacity={0.80}
                        overlayRender={() => {
                            return (<div className="absolute z-40 bottom-0 w-full bg-black h-10 items-center flex justify-center opacity-70 ">{message}</div>)
                        }}
                        onIndexChange={(index) => {
                            setImageIndex(index)
                        }}
                        onVisibleChange={(_, index) => {
                            setImageIndex(index)
                        }}
                        toolbarRender={({ rotate, onRotate, onScale, scale }) => {
                            return (
                                <div className="flex justify-center items-center gap-5">
                                    <FaArrowRotateRight className="text-zinc-400 hover:text-zinc-200 h-5 w-auto cursor-pointer" onClick={() => onRotate(rotate + 90)} />
                                    <MdOutlineZoomIn className="text-zinc-400 hover:text-zinc-200 h-7 w-auto cursor-pointer" onClick={() => onScale(scale + 1)} />
                                    <MdOutlineZoomOut className="text-zinc-400 hover:text-zinc-200 h-7 w-auto cursor-pointer" onClick={() => onScale(scale - 1)} />
                                    <a href="" download={images[0]}>
                                        <MdFileDownload className="text-zinc-400 hover:text-zinc-200 h-7 w-auto cursor-pointer" />
                                    </a>
                                </div>
                            )
                        }}
                    >
                        <div className={`grid ${images?.length >= 2 ? "grid-cols-2 gap-2" : "grid-cols-2 grid-rows-2"}`}>
                            {images.map((item, index) => {
                                return (
                                    <PhotoView key={index} src={item}>
                                        {index < 3 ? <img style={{ objectFit: 'cover' }} className={`${images?.length===1 ?"row-span-2  col-span-2":""} cursor-pointer hover:opacity-60 h-36 w-auto`} src={item} /> : index === 3 && images.length > 4 ? <div className="relative flex justify-center items-center">
                                            <div className="absolute font-semibold text-6xl z-20 cursor-pointer">+{images.length - 3}</div>
                                            <img style={{ objectFit: 'cover' }} className="opacity-25 cursor-pointer hover:opacity-15 h-36 w-auto" src={item} />
                                        </div> : index === 3 ? <img style={{ objectFit: 'cover' }} className="cursor-pointer hover:opacity-60 h-36 w-auto" src={item} /> : undefined}
                                    </PhotoView>
                                )
                            })}
                        </div>
                    </PhotoProvider>

                </div>
                <div className="flex items-center justify-between gap-1">
                    <div>
                        <TextMessageHyperLink message={message} />
                        {<div className='text-nowrap text-gray-400 font-medium opacity-85 '>
                            {timeAgo && <div className='text-[13px]'>{formatTime(timeAgo)}</div>}
                        </div>}
                    </div>
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