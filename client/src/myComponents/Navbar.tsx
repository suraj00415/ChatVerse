import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate()
    return (
        <div className="fixed top-0 w-full z-20">
            <div className='bg-zinc-900 p-2 flex justify-around items-center '>
                <div className="hover:bg-zinc-600 rounded-full p-2 cursor-pointer" onClick={() => navigate("/")}><IoArrowBack className="h-6 w-auto" /></div>
                <div>
                    <img src="./assets/Blender/logoChat2.png" className="h-9 w-auto  " alt="" />
                </div>
                <div></div>
            </div>
        </div>
    )
}
