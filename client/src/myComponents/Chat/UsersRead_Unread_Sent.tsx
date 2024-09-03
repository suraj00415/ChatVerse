import { ScrollArea } from '@/components/ui/scroll-area'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { selectCurrentChat } from '@/features/chat/chatSlice'
import moment from 'moment'
import { useSelector } from 'react-redux'

export default function UsersRead_Unread_Sent({ messageData, MessageForNoParticipants, isTimeShow = true ,isGroup}) {
    const currentChat = useSelector(selectCurrentChat)
    const currentUser = useSelector(selectCurrentUser)
    return (
        <>
            {messageData?.length !== 0 && <ScrollArea className={`${isGroup?"h-[230px]":"h-auto"} rounded-md border p-4 mt-4`}>
                <div className='flex flex-col gap-3 '>
                    {messageData?.map((id) => {
                        const participant = currentChat?.participants?.find((p) => p?._id === id?.participantId)
                        const time = moment(id?.time).format('LT');
                        const date = moment(id?.time).format('ll');
                        if (id?.participantId === currentUser?._id && messageData?.length === 1) {
                            return (
                                <div className=' bg-zinc-900 border  rounded-lg p-2 flex'>
                                    <div className="text-zinc-400 text-center ">{MessageForNoParticipants}
                                    </div>
                                </div>
                            )
                        }
                        else if (id?.participantId === currentUser?._id) return null
                        return (
                            <div className=' bg-zinc-800  rounded-lg p-2 flex justify-between items-center hover:bg-zinc-700' key={participant?._id}>
                                <div className='flex gap-2 items-center'>
                                    <div><img src={participant?.avatar} className='h-12 rounded-full' alt="" /></div>
                                    <div>
                                        <div className='font-semibold'>{participant?.name}</div>
                                        <div className=''><span className='text-lime-300'>@</span>{participant?.username}</div>
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <div className='text-zinc-400 text-sm'>{isTimeShow ? time : ""}</div>
                                    <div className='text-zinc-400 text-sm'>{isTimeShow ? date : ""}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>}
            {messageData?.length === 0 && <div className=' bg-zinc-900 border  rounded-lg p-2 flex'>
                <div className="text-zinc-400 text-center ">{MessageForNoParticipants}
                </div>
            </div >
            }
        </>
    )
}
