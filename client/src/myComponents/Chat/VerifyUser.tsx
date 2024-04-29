import { useParams } from 'react-router-dom'
import verifyGif from "../../../public/assets/1134-verified-animated.gif"
import { useResendVerifyUserMutation, useVerifyUserMutation } from '@/features/auth/authApi'
import { useEffect, useState } from 'react'
import Spinners from './Spinners'
import { toast } from '@/components/ui/use-toast'
export default function VerifyUser() {
    const { token } = useParams()
    const [verify, { isLoading }] = useVerifyUserMutation()
    const [resendVerifyEmail, { isLoading: resendVerifyLoading }] = useResendVerifyUserMutation()
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [isResendVerify, setIsResendVerify] = useState(false)
    useEffect(() => {
        verifyUser()
    }, [token])
    const resendHandler = async () => {
        try {
            const res = await resendVerifyEmail(null).unwrap()
            toast({ title: "Verification Email Sent ",description:"Now you can close this window and check your email!" })
            console.log("response", res)
        } catch (error) {
            console.log(error)
            toast({ title: error?.data?.message, variant: "destructive" })
        }
    }
    const verifyUser = async () => {
        try {
            const res = await verify(token).unwrap()
            setMessage(res?.message)
            console.log("response", res)
        } catch (error) {
            setError(error?.data?.message)
            if (error?.status === 403 || error?.status===401) {
                setIsResendVerify(true)
            }
            console.log(error)
        }
    }

    return (
        <div >
            <div className='flex justify-center items-center flex-col gap-3'>
                {!isLoading && <div className='bg-zinc-700 rounded-md p-5 flex items-center gap-5'>
                    {!error && message && <img src={verifyGif} className='h-14 ' alt="" />}
                    {error && <div className='text-xl font-bold text-red-400'>{error}</div>}
                    {message && <div className='text-xl font-bold text-lime-400'>{message}</div>}
                </div>}
                {isResendVerify && <div onClick={resendHandler} className='p-2 text-black font-bold bg-gradient-to-r  from-lime-400 to-emerald-500 rounded-lg cursor-pointer'>Resend Email</div>}
                {isLoading && <Spinners />}
            </div>
        </div>
    )
}
