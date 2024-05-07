import { selectCurrentToken } from "@/features/auth/authSlice.ts";
import { DropFiles } from "./DropFiles.tsx";
import Input from "./Input.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { useRegisterUserMutation } from "@/features/auth/authApi.ts";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

const RegisterValidationSchema = yup.object({
    username: yup.string().required('Missing Username').min(4, "Legnth Must Be more than 3 characters"),
    password: yup.string().required('Missing Password').min(5, "Legnth Must be between 8-24 characters"),
    email: yup.string().email('Invalid Email Format'),
    name: yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
    avatar: yup.mixed().required('Missing Avatar Image'),
    coverImage: yup.mixed().required('Missing Cover Image'),
}).required()

export default function Register() {
    const { toast } = useToast()
    const accessToken = useSelector(selectCurrentToken)
    const [registerUser, { isLoading }] = useRegisterUserMutation()
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm(
        {
            resolver: yupResolver(RegisterValidationSchema),
            defaultValues: {
                username: '',
                password: '',
                email: '',
                name: '',
                avatar: null,
                coverImage: null
            }
        }
    )
    const onSubmit = async (data: FormData) => {
        console.log("registerdata",data)
        try {
            const registerData = await registerUser(data).unwrap()
            console.log("registerData", registerData)
            toast({
                title: "User Successfully Registered",
                description: "Now Verify The Email"
            })
        } catch (error: any) {
            console.log(error)
            toast({ title: error?.data?.message || error?.error,variant:"destructive" })
        }
    }
    useEffect(() => {
        if (accessToken?.length > 0) {
            navigate("/");
        }
    }, [accessToken]);
    useEffect(() => {
        if (isLoading) {
            toast({ title: "Registering..." })
        }
    }, [isLoading]);
    return (
        <div className="w-screen flex justify-center items-center h-screen overflow-y-scroll py-20 bg-gradient-to-r from-lime-400 to-yellow-400 ">
            <div className=' w-full flex justify-center items-center pt-20 '>
                <div className="bg-white dark:bg-black w-[90%] lg:w-[60%]    md:my-0 rounded-lg p-10 border-2 border-blue-200 shadow-md shadow-neutral-200 dark:shadow-none dark:border-gray-900">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col md:flex-row gap-5 justify-center ">
                            <div className="flex flex-col  gap-7 ">
                                <div className="self-center text-3xl font-bold">Register</div>
                                <Input type="name" title="FullName" errors={errors} register={register} typeOfInput="text" />
                                <Input type="email" title="Email" errors={errors} register={register} typeOfInput="text" />
                                <Input type="username" title="Username" errors={errors} register={register} typeOfInput="text" />
                                <div className="flex flex-col gap-1 h-48 justify-center">
                                    <label htmlFor="username" className="font-medium">Upload Avatar Image:
                                        <sup className="text-red-700 text-sm">
                                            *
                                        </sup>
                                    </label>
                                    <DropFiles setValue={setValue} register={register} type='avatar' errors={errors} />
                                </div>
                            </div>
                            <div className=" flex flex-col gap-7">
                                <div className="flex flex-col gap-1 h-48 justify-center">
                                    <label htmlFor="username" className="font-medium">Upload Cover Image:
                                        <sup className="text-red-700 text-sm">
                                            *
                                        </sup>
                                    </label>
                                    <DropFiles setValue={setValue} register={register} type='coverImage' errors={errors} />
                                </div>
                                <Input type="password" title="Password" errors={errors} register={register} typeOfInput="password" />
                                <div className="flex flex-col gap-2 ">
                                    <button className="justify-stretch hover:opacity-80 bg-gradient-to-r from-lime-400 to-yellow-400 p-1 py-2 rounded-lg text-black font-medium">
                                        Register
                                    </button>
                                    <div className="text-sm text-lime-800  dark:text-lime-500 cursor-pointer">Forgot Password?</div>
                                </div>
                                <div>Already have an Account?
                                    <span className=" text-lime-800 dark:text-lime-500 cursor-pointer">
                                        <Link to="/login">
                                            Login
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div >
            </div >
        </div>
    )
}