import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { useLogout } from "@/hooks/useLogout";
import { RiChatNewFill } from "react-icons/ri";
import { SlOptionsVertical } from "react-icons/sl";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


export default function () {
    const navigate = useNavigate()
    const logout = useLogout()
    const user = useSelector(selectCurrentUser)

    return (
        <div className='bg-zinc-900 p-2'>
            <div className='flex justify-between gap-2 items-center'>
                {/* logo */}
                <div>
                    <div >
                        <img className='w-[50px] h-auto rounded-full' src={user?.avatar} alt="" />
                    </div>
                </div>
                <div>
                    {/* <div className="font-extrabold text-2xl bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">ChatVerse</div> */}
                    <img src="./assets/Blender/logoChat2.png" className="h-9 w-auto  " alt="" />
                </div>
                {/*  */}
                <div className="flex justify-center items-center gap-7">
                    {/* new Chat */}
                    <div className="z-30  p-2 rounded-full hover:bg-zinc-700 cursor-pointer" onClick={() => navigate('/add')}>
                        <RiChatNewFill className="h-6  w-auto   text-white " />
                    </div>
                    {/* options */}
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className='outline-none rounded-full hover:bg-zinc-700 cursor-pointer p-2'><SlOptionsVertical className='h-4 rounded-full w-auto' /></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
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