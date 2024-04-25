import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate()
    return (
        <div className="fixed top-0 w-full z-20">
            <div className='bg-zinc-900 p-2 flex justify-around items-center '>
                <div className="hover:bg-zinc-600 rounded-full p-2 cursor-pointer" onClick={() => navigate("/")}><IoArrowBack className="h-6 w-auto" /></div>
                <div>
                    <div className="cursor-pointer font-extrabold text-2xl bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">ChatVerse</div>
                </div>
                <div></div>
            </div>
        </div>
    )
}
