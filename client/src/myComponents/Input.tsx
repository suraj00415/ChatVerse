import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
export default function Input({ errors, register, title, type, typeOfInput }: any) {
    const [show, setShow] = useState(false)
    return (
        <div className="flex flex-col gap-1 justify-center relative">
            <label htmlFor={type} className="font-medium">{title}: <sup className="text-red-700 text-sm">*</sup></label>
            <input {...register(type)}  type={show ? "text" : typeOfInput} id={type} placeholder={`Enter ${type}`} className="p-2  bg-slate-200 rounded-lg dark:bg-zinc-900 outline-blue-400" />
            {
                typeOfInput === "password" ? (
                    <div className="absolute right-5 top-10 cursor-pointer" onClick={() => setShow(prev => !prev)}>
                        {show ? <FaEyeSlash className="h-5 w-auto" /> : <FaEye className="h-5 w-auto" />}
                    </div>) : ""
            }
            {errors[type] &&
                (
                    <div className="text-red-600 text-[.78rem] flex items-center gap-2  bg-red-200 rounded-lg p-1 w-fit px-4 "><FaInfoCircle />{errors[type].message}</div>
                )
            }
        </div>
    )
}
