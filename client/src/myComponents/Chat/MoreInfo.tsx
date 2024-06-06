import {
    Dialog,
    DialogTrigger
} from "@/components/ui/dialog"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useCreateOneChatMutation, useRemoveParticipantsMutation } from "@/features/chat/chatApi"
import { selectCurrentChat, selectOtherParticipants, setCurrentChat } from '@/features/chat/chatSlice'
import { useAddAdminsMutation, useRenameGroupChatMutation } from "@/features/group/groupApi"
import { Emoji, EmojiStyle } from "emoji-picker-react"
import moment from 'moment'
import { useEffect, useState } from "react"
import { IoMdMore } from 'react-icons/io'
import { MdEdit, MdOutlineAddAPhoto } from "react-icons/md"
import { RiAdminFill } from "react-icons/ri"
import { PhotoProvider, PhotoView } from "react-photo-view"
import { useDispatch, useSelector } from 'react-redux'

export default function MoreInfo() {
    const currentChat = useSelector(selectCurrentChat)
    const otherParticipant = useSelector(selectOtherParticipants)
    const user = useSelector(selectCurrentUser)
    const [members, setMembers] = useState<Object[]>([])
    const [searchValue, setSearchValue] = useState<string>("")
    const [editGroupName, setEditGroupName] = useState<string>(currentChat?.Group?.name)

    const formatDate = (dates) => {
        const mongoDate = new Date(dates)
        const date = moment(mongoDate).format('LL')
        return date
    }
    const [addAdmin] = useAddAdminsMutation()
    const [removeParticipant] = useRemoveParticipantsMutation()
    const [createOnetoOne] = useCreateOneChatMutation()
    const [renameGroup] = useRenameGroupChatMutation()

    const dispatch = useDispatch()

    useEffect(() => {
        const membersWOLoggedInUser = currentChat?.participants?.filter((participant) => {
            if (participant?._id !== user?._id) return participant
        })
        const modifiedLoggedInUser = { ...user, name: "You" }
        const totalUser = [modifiedLoggedInUser, ...membersWOLoggedInUser]
        const filterMember = totalUser.filter((participant) => {
            if (participant?.name?.toLowerCase()?.trim()?.match(searchValue.toLowerCase().trim()) ||
                participant?.username?.toLowerCase()?.trim()?.match(searchValue.toLowerCase().trim())) return participant
        })
        setMembers(() => {
            if (searchValue === "") return totalUser
            else return [...filterMember]
        })
    }, [currentChat, searchValue])

    const addAdminFunction = async (participantId) => {
        try {
            const data = {
                chatId: currentChat?._id,
                admins: [participantId]
            }
            const res = await addAdmin(data).unwrap()
            console.log(res)
        } catch (error) {
            toast({ title: error?.data?.message, variant: "destructive" })
            console.log(error)
        }
    }
    const createChatFunction = async (singleParticipant) => {
        try {
            const res = await createOnetoOne(singleParticipant).unwrap()
            console.log("response", res)

            if (res?.statuscode === 200 && res?.message === "Chat Already Existed") {
                dispatch(setCurrentChat(res?.data[0]))
            }
            else {
                toast({ title: `Now You Can Chat with ${res?.data[0]?.participants[1]?.name}` })
                dispatch(setCurrentChat(res?.data[0]))
            }
        } catch (error) {
            toast({ title: error?.data?.message, variant: "destructive" })
        }
    }

    const removeParticipantFunction = async (participantId) => {
        try {
            const data = {
                chatId: currentChat?._id,
                participants: [participantId]
            }
            const res = await removeParticipant(data).unwrap()
            console.log(res)
        } catch (error) {
            toast({ title: error?.data?.message, variant: "destructive" })
            console.log(error)
        }
    }
    const renameGroupFunction = async (chatId) => {
        try {
            const data = {
                chatId,
                name: editGroupName
            }
            if (editGroupName !== currentChat?.Group?.name) {
                const res = await renameGroup(data).unwrap()
                console.log(res)
                toast({ title: "Group Name Changed Successfully!" })
            }
            else {
                toast({ title: "Edited Name is Same !!!", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: error?.data?.message, variant: "destructive" })
        }
    }
    return (
        <div className='text-white w-full '>
            <div className='flex justify-center flex-col items-center gap-7 w-full'>
                <div className="relative ">
                    <PhotoProvider maskOpacity={0.80} bannerVisible={false} >
                        <PhotoView key={1} src={currentChat?.isGroup ? currentChat?.Group?.avatar : otherParticipant?.avatar}>
                            <img className="rounded-full h-52 cursor-pointer" src={currentChat?.isGroup ? currentChat?.Group?.avatar : otherParticipant?.avatar} alt="" />
                        </PhotoView>
                    </PhotoProvider>
                    <div className="absolute bg-white p-1 rounded-full right-3 bottom-4 cursor-pointer">
                        <MdOutlineAddAPhoto className="bg-white text-black h-5 w-auto" />
                    </div>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <div className="flex justify-center items-center gap-2">
                        <div className='text-2xl font-bold'>{currentChat?.isGroup ? currentChat?.Group?.name : otherParticipant?.name}</div>
                        <div >
                            {currentChat?.isGroup &&
                                <AlertDialog>
                                    <AlertDialogTrigger className="cursor-pointer hover:bg-zinc-700 rounded-full p-1 ">
                                        <MdEdit className="h-5 w-auto" />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Edit Group Title</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                <div className="flex items-center">
                                                    <div className="w-28 text-zinc-300">Group Name:</div>
                                                    <div className="w-full ">
                                                        <input
                                                            type="text"
                                                            placeholder="Edit group name..."
                                                            className="w-full p-2 rounded-lg pl-3 bg-zinc-800"
                                                            onChange={(e) => setEditGroupName(e.target.value)}
                                                            value={editGroupName} />
                                                    </div>
                                                </div>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => renameGroupFunction(currentChat?._id)}
                                            >
                                                Edit
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            }
                        </div>

                    </div>
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
                {currentChat?.isGroup &&
                    (
                        <Dialog >
                            <DialogTrigger className='w-full flex justify-between items-center hover:bg-zinc-800 bg-zinc-900 p-3 cursor-pointer rounded-md'>
                                <div className='font-bold '>Add Members</div>
                                <div ><RiAdminFill className='text-lime-400 h-6 w-auto' /></div>                            </DialogTrigger>
                        </Dialog>
                    )
                }
                {currentChat?.isGroup && (<div className='w-full '>
                    <div className='bg-zinc-900 w-full rounded-md p-3'>
                        <div className='flex sm:flex-row justify-evenly items-center flex-col'>
                            <div className='font-bold'>
                                Members :
                            </div>
                            <div className="">
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => { setSearchValue(e.target.value) }}
                                    placeholder='Search Members'
                                    className='p-2 rounded-xl bg-zinc-800 pl-4 w-[150px]' />
                            </div>
                        </div>

                        <ScrollArea className="h-[300px] rounded-md border p-4 mt-4">
                            <div className='flex flex-col gap-3 '>
                                {members && members?.map((participant) => {
                                    let Admin = []
                                    Admin = currentChat?.admins?.filter((admin) => participant?._id === admin?._id)
                                    let isAdmin = false
                                    if (Admin.length > 0) {
                                        isAdmin = true
                                    }
                                    return (
                                        <div className=' bg-zinc-800 cursor-pointer rounded-lg p-2 flex justify-between items-center hover:bg-zinc-700' key={participant?._id}>
                                            <div className='flex gap-2 items-center'>
                                                <div><img src={participant?.avatar} className='h-12 rounded-full' alt="" /></div>
                                                <div>
                                                    <div className='font-semibold'>{participant?.name}</div>
                                                    <div className=''><span className='text-lime-400'>@</span>{participant?.username}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {isAdmin && <div className='p-1 font-bold  bg-lime-900 rounded-lg border text-xs border-lime-400'>Admin</div>}
                                                {<DropdownMenu>
                                                    <DropdownMenuTrigger><IoMdMore className='h-5 w-auto rounded-full hover:bg-zinc-600' /></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => addAdminFunction(participant?._id)}>
                                                            Add Admin
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => removeParticipantFunction(participant?._id)}>
                                                            Kick
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => createChatFunction(participant?._id)}>Message</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                }
                                            </div>
                                        </div>
                                    )
                                })}
                                {members.length == 0 && <div className="text-zinc-400 text-center">No Members found</div>}
                            </div>
                        </ScrollArea>
                    </div>
                </div>)}
            </div>
        </div>
    )
}