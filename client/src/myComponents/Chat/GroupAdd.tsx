import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from '@/components/ui/use-toast'
import { useCreateGroupMutation, useCreateOneChatMutation, useSearchAvailableUsersQuery } from '@/features/chat/chatApi'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IoClose } from "react-icons/io5"
import * as yup from "yup"
import { DropFiles } from '../DropFiles'
import Input from '../Input'
import Spinners from "./Spinners"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setCurrentChat } from "@/features/chat/chatSlice"

export default function GroupAdd() {
    const [values, setValues] = useState("")
    const [data, setData] = useState([])
    const [members, setMembers] = useState([])
    const { toast } = useToast()
    const [isAddGroup, setIsAddGroup] = useState(false)
    const { data: search, refetch, isFetching: isFetchingAvailableUser } = useSearchAvailableUsersQuery(values)
    const [createGroup, { isLoading }] = useCreateGroupMutation()
    const [createOnetoOne] = useCreateOneChatMutation()
    const [singleParticipant, setSingleParticipant] = useState({})
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        refetch()
        setData(() => {
            return search?.data?.filter((user) => {
                const isPresent = members.some((member) => {
                    return member?._id === user?._id
                })
                if (!isPresent) return user
            })
        })
    }, [values, search, members])

    const removeMember = (userId) => {
        setMembers(() => {
            return members?.filter((user) => {
                if (user?._id !== userId) return user
            })
        })
    }

    const createOneToOneHandler = async () => {
        try {
            const res = await createOnetoOne(singleParticipant?._id).unwrap()
            console.log("response", res)
            if (res?.statuscode !== 201) {
                toast({ title: res?.message, variant: "destructive" })
            }
            else {
                toast({ title: `Now You Can Chat with ${singleParticipant?.name}` })
            }
        } catch (error) {
            console.log(error)
        }
    }
    const schema = yup
        .object({
            name: yup.string().required(),
            avatar: yup.mixed().required('Missing Avatar Image'),
            description: yup.string()
        })
        .required()

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        defaultValues: {
            name: "",
            description: "",
            avatar: null
        },
        resolver: yupResolver(schema)
    })
    const onSubmitHandler = async (data) => {
        const participants = members?.map((user) => user?._id)
        const dataToSend = { ...data, participants }
        try {
            const res = await createGroup(dataToSend).unwrap()
            toast({ title: "Group Created Successfully" })
            console.log("response", res?.data)
            dispatch(setCurrentChat(res?.data))
            navigate("/")
        } catch (error) {
            toast({ title: error?.data?.message || "Something went wrong", variant: "destructive" })
            console.log(error)
        }
        console.log({ ...data, participants })
    }
    useEffect(() => {
        if (isLoading) {
            toast({ title: "Loading..." })
        }
    }, [isLoading])
    return (
        <>
            {<div className='w-full h-full flex justify-center items-center '>
                <form onSubmit={handleSubmit(onSubmitHandler)}>
                    <div className='flex p-3 h-full items-center justify-center'>
                        <div className='  w-[100%]  bg-zinc-800 gap-10 flex flex-col-reverse lg:flex-row justify-around py-7 rounded-md px-8 '>
                            <div className="">
                                <div className="font-medium mb-2">
                                    Add Members:
                                </div>
                                <div className='w-full'>
                                    <div className="w-full mt-4]">
                                        <input placeholder="Search Available Users" value={values} onChange={(e) => setValues(e.target.value)} type="text" className="w-full p-2 bg-zinc-900 rounded-md" />
                                    </div>
                                    <ScrollArea className="h-[300px] w-auto lg:w-[350px] rounded-md bg-zinc-900 mt-2 p-4">
                                        <div className="">
                                            {
                                                data && data?.map((user, i) => {
                                                    return (
                                                        <div className="flex flex-col mt-2 cursor-pointer " key={i} onClick={() => {
                                                            if (isAddGroup) {
                                                                setMembers((prev) => [...prev, user])
                                                            }
                                                            else {
                                                                setSingleParticipant(user)
                                                            }
                                                        }}>
                                                            <div className="p-2 bg-zinc-800 hover:bg-zinc-700 flex justify-start items-center rounded-md gap-5 w-full" >
                                                                <div><img className="h-14 rounded-full" src={user?.avatar} alt="" /></div>
                                                                <div>
                                                                    <div className="">{user?.name}</div>
                                                                    <div className=""><span className="text-lime-400">@</span>{user?.username}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                            {
                                                !isFetchingAvailableUser && !data?.length && <div>No Users Found</div>
                                            }
                                            {
                                                isFetchingAvailableUser && <Spinners />
                                            }
                                        </div>
                                    </ScrollArea>
                                </div>
                                {isAddGroup && <div>
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
                                </div>}
                                {!isAddGroup && <div>
                                    <div className="h-[120px] w-auto lg:w-[350px] rounded-md bg-zinc-900 mt-2 p-4">
                                        <div className="flex gap-2 flex-wrap relative">
                                            <div className="flex flex-col mt-2  w-full ">
                                                {singleParticipant && Object.keys(singleParticipant)?.length > 0 &&
                                                    (<div className="p-2 cursor-pointer bg-zinc-800 hover:bg-zinc-700 flex justify-start items-center rounded-md gap-5 w-full" >
                                                        <div><img className="h-14 rounded-full" src={singleParticipant?.avatar} alt="" /></div>
                                                        <div>
                                                            <div className="">{singleParticipant?.name}</div>
                                                            <div className=""><span className="text-lime-400">@</span>{singleParticipant?.username}</div>
                                                        </div>
                                                    </div>)
                                                }
                                                {!Object.keys(singleParticipant)?.length &&
                                                    (<div className="" >
                                                        Select Any One User
                                                    </div>)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>}
                            </div>
                            <div className='flex flex-col gap-3 '>
                                <div className="flex justify-center ">
                                    <div className=" gap-1 items-center p-1 rounded-full justify-start bg-zinc-700 flex">
                                        <div className={`p-2  bg-zinc-800 rounded-full  font-bold px-3 ${isAddGroup ? "hover:opacity-80 cursor-pointer" : "bg-gradient-to-r from-lime-400 to-emerald-500 bg-clip-text text-transparent select-none cursor-default"}`} onClick={() => setIsAddGroup(false)}>Chat </div>
                                        <div className={`p-2  bg-zinc-800 rounded-full  font-bold px-3 ${isAddGroup ? "bg-gradient-to-r from-lime-400 to-emerald-500 bg-clip-text text-transparent select-none cursor-default" : "hover:opacity-80 cursor-pointer"}`} onClick={() => setIsAddGroup(true)}>Group</div>
                                    </div>
                                </div>
                                {isAddGroup && (
                                    <>
                                        <div>
                                            <Input register={register} title="Group name" type={"name"} typeOfInput="text" errors={errors} />
                                        </div>
                                        <div>
                                            <Input register={register} title="Description" type={"description"} typeOfInput="text" errors={errors} />
                                        </div>
                                        <div>
                                            <div className="flex flex-col gap-1 h-48 justify-center">
                                                <label htmlFor="username" className="font-medium">Upload Group Image:
                                                    <sup className="text-red-700 text-sm">
                                                        *
                                                    </sup>
                                                </label>
                                                <DropFiles setValue={setValue} register={register} type='avatar' errors={errors} />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {
                                    !isAddGroup && (
                                        <div>
                                            <img src="/assets/ChatBack.jpg" alt="" className="h-[23rem] rounded-lg w-auto" />
                                        </div>
                                    )
                                }
                                {isAddGroup && <div className="flex justify-center pt-10">
                                    <button className="p-2 hover:opacity-70 bg-gradient-to-r  from-lime-400 to-emerald-500 rounded-lg cursor-pointer text-black font-bold">
                                        Create Group
                                    </button>
                                </div>
                                }
                                {
                                    !isAddGroup && <div className="flex justify-center pt-10">
                                        <button className="p-2 hover:opacity-70 bg-gradient-to-r  from-lime-400 to-emerald-500 rounded-lg cursor-pointer text-black font-bold" onClick={createOneToOneHandler}>
                                            Create Chat
                                        </button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </form>
            </div>}

        </>

    )
}
