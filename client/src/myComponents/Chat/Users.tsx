import { ScrollArea } from '@/components/ui/scroll-area';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { selectAllChats } from '@/features/chat/chatSlice';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function Users() {
    const [values, setValues] = useState("")
    const [members, setMembers] = useState([])
    const chats = useSelector(selectAllChats);
    const [data, setData] = useState(chats)
    const user = useSelector(selectCurrentUser)
    useEffect(() => {
        const setDataVal = chats?.filter((chat) => {
            if (!members.some((mem) => mem?._id === chat?._id)) return chat
        })
        setData(setDataVal?.filter((chat) => {
            const isGroup = chat?.isGroup
            const otherParticipant = chat?.participants?.filter((participant) => {
                if (participant?._id !== user?._id)
                    return participant
            })
            if (isGroup && chat?.Group?.name?.toLowerCase()?.includes(values?.toLowerCase().trim())) return chat
            if (!isGroup && otherParticipant[0]?.name?.toLowerCase()?.includes(values?.toLowerCase().trim())) return chat
        }))
    }, [values, members])

    const removeMember = (userId) => {
        setMembers(() => {
            return members?.filter((user) => {
                if (user?._id !== userId) return user
            })
        })
    }
    return (
        <div className=''>
            <div className='w-full mt-2'>
                <div className="w-full mt-4]">
                    <input placeholder="Search Chats" value={values} onChange={(e) => setValues(e.target.value)} type="text" className="w-full p-2 bg-zinc-900 rounded-md" />
                </div>
                <ScrollArea className="h-[300px] w-auto  rounded-md bg-zinc-900 mt-2 p-4 ">
                    <div className="">
                        {
                            data && data?.map((chat, i) => {
                                const isGroup = chat?.isGroup
                                const otherParticipant = chat?.participants?.filter((participant) => {
                                    if (participant?._id !== user?._id)
                                        return participant
                                })
                                return (
                                    <div>
                                        {chat && <div className="flex flex-col mt-2 cursor-pointer " key={i} onClick={() => {
                                            setMembers((prev) => [...prev, chat])
                                            setValues("")
                                        }}>
                                            <div className="p-2 bg-zinc-800 hover:bg-zinc-700 flex justify-start items-center rounded-md gap-5 w-full" >
                                                <div><img className="h-14 rounded-full" src={isGroup ? chat?.Group?.avatar : otherParticipant[0]?.avatar} alt="" /></div>
                                                <div>
                                                    <div className="">{isGroup ? chat?.Group?.name : otherParticipant[0]?.name}</div>
                                                    <div className="">{isGroup ? "" : <span className="text-lime-400">@</span>}{isGroup ? "" : otherParticipant[0]?.username}</div>
                                                </div>
                                            </div>
                                        </div>}
                                    </div>
                                )
                            })
                        }
                        {
                            !data?.length && <div>No Users Found</div>
                        }
                    </div>
                </ScrollArea>
            </div>
            <div>
                <ScrollArea className="h-[100px] w-auto rounded-md bg-zinc-900 mt-2 p-4">
                    <div className="flex gap-2 flex-wrap relative">
                        <div className="absolute right-4 ">
                            <div className="font-bold  fixed  px-1 bg-lime-400 rounded-md text-black">
                                {members?.length}
                            </div>
                        </div>
                        {
                            members && members?.map((users, i) => {
                                const isGroup = users?.isGroup
                                const otherParticipant = users?.participants?.filter((participant) => {
                                    if (participant?._id !== user?._id)
                                        return participant
                                })
                                return (
                                    <div className=" flex flex-col mt-2 cursor-pointer " key={i}>
                                        <div className="px-2 bg-zinc-800 flex items-center rounded-md gap-2" >
                                            <div><img className="h-5 rounded-full" src={isGroup ? users?.Group?.avatar : otherParticipant[0]?.avatar} alt="" /></div>
                                            <div className=""><span className="text-lime-400">@</span>{isGroup ? users?.Group?.name : otherParticipant[0]?.username}</div>
                                            <div className='hover:bg-zinc-700  rounded-full p-[.075rem]' onClick={() => removeMember(users?._id)}><IoClose /></div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                        {
                            !members?.length && <div>No Members</div>
                        }
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
