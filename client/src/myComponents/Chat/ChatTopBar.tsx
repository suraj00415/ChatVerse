import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

import { selectCurrentUser } from '@/features/auth/authSlice';
import { selectCurrentChat, selectOtherParticipants, setCurrentChat, setOtherParicipantChat } from '@/features/chat/chatSlice';
import { IoIosSearch } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";
import { useDispatch, useSelector } from 'react-redux';
import MoreInfo from "./MoreInfo";
import { useEffect } from "react";
import { useDeleteGroupMutation } from "@/features/chat/chatApi";
import { setIsSelectionOpen } from "@/features/messages/messageSlice";

export default function ChatTopBar({ typing, typingData }) {
  useEffect(() => {
    console.log("TypingData", typingData)
  }, [typingData])
  const dispatch = useDispatch()
  const currentChat = useSelector(selectCurrentChat)
  const user = useSelector(selectCurrentUser)
  const otherParticipant = useSelector(selectOtherParticipants)
  const [deleteGroup, { isLoading }] = useDeleteGroupMutation()
  let participantsName = "You"
  if (currentChat?.isGroup) {
    currentChat?.participants.map((participant, i) => {
      if (i < 6 && participant?._id !== user?._id) {
        participantsName = participantsName + ", " + participant?.name
      }
      else if (i >= 6 && i < 7 && currentChat?.participants?.length >= 7) {
        participantsName = participantsName + ", more...."
      }
      else return
    })
  }
  const isAdmin = currentChat?.admins?.some((admin) => {
    return admin?._id === user?._id
  })
  const deleteGroupHandler = async () => {
    try {
      const res = await deleteGroup(currentChat?._id).unwrap()
      console.log(res)
      dispatch(setCurrentChat(null))
      dispatch(setOtherParicipantChat([]))
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="" >
      {currentChat && <div className=' bg-zinc-800 w-full border-b border-zinc-700'>
        <div className='flex justify-between items-center w-full'>
          <div className='flex items-center w-full'>
            <div className='m-2'>
              <div className="h-[50px] flex justify-center items-center">
                <img className='min-w-[40px] w-[50px] h-auto rounded-full' src={currentChat?.isGroup ? currentChat?.Group?.avatar : otherParticipant?.avatar} alt="" />
              </div>
            </div>
            <Sheet >
              <SheetTrigger className='hover:bg-zinc-700 cursor-pointer w-[90%]  pl-2 rounded-md py-1'>
                <div className='flex flex-col justify-start'>
                  <div className='font-bold text-xl self-start'>{currentChat?.isGroup ? currentChat?.Group?.name : otherParticipant?.name}</div>
                  <div className='flex gap-1 text-sm '>
                    {!typing && !typingData?.length &&
                      <div className='tracking-wide  text-left'>{currentChat?.isGroup ? participantsName : "Tap for more info"}</div>
                    }
                    {
                      typing && typingData?.length > 0 && typingData?.map((data) => {
                        return <div className='tracking-wide text-lime-300'>{data?.user?.name + " Typing..."}</div>
                      })
                    }
                  </div>
                </div>
              </SheetTrigger>
              <SheetContent className="overflow-y-scroll w-[380px]">
                <SheetTitle>{currentChat?.isGroup ? "Group Info" : "Personal Info"}</SheetTitle>
                <MoreInfo />
              </SheetContent>
            </Sheet>

          </div>
          <div className='flex justify-center items-center gap-5'>
            <div className='hover:bg-zinc-700 cursor-pointer rounded-full p-2'>
              <IoIosSearch className='h-6 w-auto' />
            </div>
            <AlertDialog >
              <DropdownMenu >
                <DropdownMenuTrigger className='outline-none rounded-full hover:bg-zinc-700 cursor-pointer p-2'><SlOptionsVertical className='h-4 rounded-full w-auto' /></DropdownMenuTrigger>
                <DropdownMenuContent className="">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => dispatch(setIsSelectionOpen(true))} >Select Messages</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  {isAdmin && currentChat?.isGroup && <DropdownMenuItem >
                    <AlertDialogTrigger >Delete Group</AlertDialogTrigger>
                  </DropdownMenuItem>
                  }
                </DropdownMenuContent>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete the whole group and its related chats and media files.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteGroupHandler}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </DropdownMenu>
            </AlertDialog>
            <div></div>
          </div>
        </div>
      </div>}
    </div>
  )
}
