import Input from "./Input.tsx";
import { selectCurrentToken, setCredientials } from "@/features/auth/authSlice.ts";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useLoginMutation } from "../features/auth/authApi.ts";
import { useToast } from "@/components/ui/use-toast.ts";

const LoginValidationSchema = yup.object({
    username: yup.string().required('Missing Username').min(4, "Legnth Must Be more than 3 characters"),
    password: yup.string().required('Missing Password').min(5, "Legnth Must be between 8-24 characters")
}).required()

export default function Login() {
    const [login, { isLoading }] = useLoginMutation()
    const accessToken = useSelector(selectCurrentToken)
    const { toast } = useToast()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const from = location.state?.from?.pathname || "/"
    const { register, handleSubmit, formState: { errors } } = useForm(
        {
            resolver: yupResolver(LoginValidationSchema),
            defaultValues: {
                username: '',
                password: ''
            }
        }
    )
    const onSubmit = async (data: any) => {
        console.log("data", data)
        try {
            const userData = await login(data).unwrap()
            console.log("userData", userData)
            dispatch(setCredientials(userData))
            toast({ title: "Logged In Successfully" })
            navigate(from, { replace: true });
        } catch (error: any) {
            console.log(error)
            toast({ title: error?.data?.message ,variant:"destructive"})
        }
    }

    useEffect(() => {
        if (isLoading) { toast({ title: "loading...." }) }
    }, [isLoading])
    useEffect(() => {
        if (accessToken?.length > 0) {
            navigate(from);
            console.log("from", from)
        }
    }, [accessToken]);
    return (
        <>
            <div className=' w-screen flex justify-center items-center h-screen bg-gradient-to-r from-lime-400 to-yellow-400'>
                <div className="bg-white dark:bg-black w-[90%] md:w-[50%] lg:w-[35%] rounded-lg p-10 border-2 border-blue-200 shadow-md dark:shadow-none dark:border-none shadow-neutral-200">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-5 justify-center ">
                            <div className="self-center text-3xl font-bold">Login</div>
                            <Input errors={errors} register={register} title={"Username"} type={"username"} typeOfInput={"text"} />
                            <Input errors={errors} register={register} title={"Password"} type={"password"} typeOfInput={"password"} />
                            <div className="flex flex-col gap-2">
                                <button className="justify-stretch bg-gradient-to-r from-lime-400 to-yellow-400 p-1 py-2 rounded-lg text-black font-medium" >
                                    Login
                                </button>
                                <div className="text-sm text-lime-800  dark:text-lime-500 cursor-pointer">Forgot Password?</div>
                            </div>
                            <div>Dont have an Account? <span className=" dark:text-lime-500 text-lime-800 cursor-pointer">
                                <Link to="/register">
                                    Create Account
                                </Link>
                            </span> </div>
                        </div>
                    </form>
                </div >
            </div >
        </>
    )
}
