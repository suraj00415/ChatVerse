import { selectCurrentUser } from '@/features/auth/authSlice'
import { selectCurrentChat, selectOtherParticipants } from '@/features/chat/chatSlice'
import React from 'react'
import { IoIosSearch } from 'react-icons/io'
import { useSelector } from 'react-redux'
import moment from 'moment';

export default function MoreInfo() {
    const currentChat = useSelector(selectCurrentChat)
    const otherParticipant = useSelector(selectOtherParticipants)
    const user = useSelector(selectCurrentUser)
    const formatDate = (dates) => {
        const mongoDate = new Date(dates)
        const date = moment(mongoDate).format('LL')
        return date
    }
    return (
        <div className='text-white w-full'>
            <div className='flex justify-center flex-col items-center gap-10 w-full'>
                <div>
                    <img className="rounded-full h-52" src={currentChat?.isGroup ? currentChat?.Group?.avatar : otherParticipant?.avatar} alt="" />
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <div className='text-2xl font-bold'>{currentChat?.isGroup ? currentChat?.Group?.name : otherParticipant?.name}</div>
                    <div className='flex justify-center items-center gap-2'>
                        <div className='h-1 w-1 bg-white rounded-full'></div>
                        <div className='text-lg font-semibold'>{currentChat?.isGroup ? currentChat?.participants?.length + " " + "Members" : otherParticipant?.email}</div>
                    </div>
                </div>
                <div className='w-full bg-zinc-900 p-3 flex flex-col gap-2 rounded-md'>
                    <div className='font-bold '>Description</div>
                    <div>{currentChat?.isGroup ? currentChat?.Group?.description ? currentChat?.Group?.description : "Happiness is a journey, not a destination " : user?.about ? user?.about : "Happiness is a journey, not a destination "}</div>
                </div>
                {currentChat?.isGroup &&
                    (
                        <div className='w-full bg-zinc-900 p-3  rounded-md'>
                            <div className='flex flex-col gap-2'>
                                <div className='flex items-center gap-2'>
                                    <div className='font-bold'>Group Created By :</div>
                                    <div className=''>{currentChat?.Group?.groupCreator?.name}</div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <div className='font-bold'>Group Created On :</div>
                                    <div className=''>{formatDate(currentChat?.createdAt)}</div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {currentChat?.isGroup && (<div className='w-full '>
                    <div className='bg-zinc-900 w-full rounded-md p-3'>
                        <div className='flex sm:flex-row justify-between items-center flex-col sm:gap-0 gap-2  '>
                            <div className='font-bold '>
                                Members :
                            </div>
                            <div>
                                <input type="text" placeholder='Search Members' className='p-2 rounded-xl bg-zinc-800 pl-4' />
                            </div>
                            <div className='hover:bg-zinc-500 cursor-pointer rounded-full p-2'>
                                <IoIosSearch className='h-6 w-auto' />
                            </div>
                        </div>

                        <div className='flex flex-col gap-3 mt-5 '>
                            {currentChat?.participants?.map((participant) => {
                                let Admin = []
                                Admin = currentChat?.admins?.filter((admin) => participant?._id === admin?._id)
                                let isAdmin = false
                                if (Admin.length > 0) {
                                    isAdmin = true
                                }
                                return (
                                    <div className=' bg-zinc-800 cursor-pointer rounded-lg p-2 flex justify-between items-center hover:bg-zinc-700'>
                                        <div className='flex gap-2 items-center'>
                                            <div><img src={participant?.avatar} className='h-12 rounded-full' alt="" /></div>
                                            <div>
                                                <div className='font-semibold'>{participant?.name}</div>
                                                <div className=''><span className='text-lime-400'>@</span>{participant?.username}</div>
                                            </div>
                                        </div>
                                        {isAdmin && <div className='p-1 font-bold  bg-lime-900 rounded-lg border text-xs border-lime-400'>Admin</div>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>)}
            </div>
        </div>
    )
}
