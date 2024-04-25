import { toast } from "@/components/ui/use-toast"
import { useLogoutMutation } from "@/features/auth/authApi"
import { setLogout } from "@/features/auth/authSlice"
import { useDispatch } from "react-redux"

export const useLogout = () => {
    const dispatch = useDispatch()
    const [logout] = useLogoutMutation()
    return async () => {
        try {
            const res = await logout(null).unwrap()
            console.log(res)
            dispatch(setLogout())
            dispatch({ type: "RESET" })
            toast({ title: "Logged Out Successfully" })
        } catch (error) {
            console.log(error)
            toast({ title: error?.error })
        }
    }
}