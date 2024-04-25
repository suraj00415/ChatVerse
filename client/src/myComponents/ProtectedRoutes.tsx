import { selectCurrentToken, setLogout } from '@/features/auth/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute() {
    const accessToken = useSelector(selectCurrentToken)
    const location = useLocation()
    const dispatch = useDispatch()
    if (!accessToken?.length) {
        dispatch(setLogout())
    }
    return (
        accessToken?.length > 1 ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
    )
}