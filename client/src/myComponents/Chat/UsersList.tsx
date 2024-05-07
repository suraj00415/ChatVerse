import { ScrollArea } from '@/components/ui/scroll-area'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { selectAllChats } from '@/features/chat/chatSlice'
import { useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { useSelector } from 'react-redux'



export default function UsersList() {
    const [values, setValues] = useState("")
    const [members, setMembers] = useState([])
    const chats = useSelector(selectAllChats);
    const [data, setData] = useState(chats)
    const user = useSelector(selectCurrentUser)
        useEffect(() => {
        if (values === "") {
            setData(chats)
        }
    }, [values])

    useEffect(()=>{
        setData(chats?.filter((chat)=>{
            // if()
        }))
    },[values])
    const removeMember = (userId) => {
        setMembers(() => {
            return members?.filter((user) => {
                if (user?._id !== userId) return user
            })
        })
    }
    return (
        <>
            <div className='w-full'>
                <div className="w-full mt-4]">
                    <input placeholder="Search Available Users" value={values} onChange={(e) => setValues(e.target.value)} type="text" className="w-full p-2 bg-zinc-900 rounded-md" />
                </div>
                <ScrollArea className="h-[300px] w-auto lg:w-[350px] rounded-md bg-zinc-900 mt-2 p-4">
                    <div className="">
                        {
                            data && data?.map((chat, i) => {
                                const isGroup = chat?.isGroup
                                const otherParticipant = chat?.participants?.filter((participant) => {
                                    if (participant?._id !== user?._id)
                                        return participant
                                })
                                console.log("Other Par", otherParticipant)
                                return (
                                    <div>

                                        {chat && <div className="flex flex-col mt-2 cursor-pointer " key={i} onClick={() => {
                                            setMembers((prev) => [...prev, chat])
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
                <ScrollArea className="h-[120px] w-auto lg:w-[350px] rounded-md bg-zinc-900 mt-2 p-4">
                    <div className="flex gap-2 flex-wrap relative">
                        <div className="absolute right-4 ">
                            <div className="font-bold  fixed  px-1 bg-lime-400 rounded-md text-black">
                                {members?.length}
                            </div>
                        </div>
                        {
                            members && members?.map((user, i) => {
                                return (
                                    <div className=" flex flex-col mt-2 cursor-pointer " key={i}>
                                        <div className="px-2 bg-zinc-800 flex items-center rounded-md gap-2" >
                                            <div><img className="h-5 rounded-full" src={user?.avatar} alt="" /></div>
                                            <div className=""><span className="text-lime-400">@</span>{user?.username}</div>
                                            <div className='hover:bg-zinc-700  rounded-full p-[.075rem]' onClick={() => removeMember(user?._id)}><IoClose /></div>
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
        </>
    )
}
