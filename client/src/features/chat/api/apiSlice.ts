import { BaseQueryApi, createApi, FetchArgs, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import { setCredientials, setLogout } from "../../auth/authSlice"

const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/v1",
    // baseUrl: "http://192.168.29.187:4000/api/v1",
    credentials: 'include',
    prepareHeaders: (headers, { getState }: any) => {
        const token = getState().auth.token
        if (token) {
            headers.set("Authorization", `Bearer ${token}`)
        }
        return headers
    },
})

const baseQueryWithReauth = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
    let result = await baseQuery(args, api, extraOptions)
    if (result?.error?.status === 401) {
        console.log('sending refresh token')
        const refreshResult = await baseQuery('/users/refresh-token', api, extraOptions)
        console.log(refreshResult)
        if (refreshResult?.data) {
            const user = api?.getState()?.auth?.user
            if (user) {
                api.dispatch(setCredientials({ data: { accessToken: refreshResult.data?.data?.accessToken, user } }))
            }
            result = await baseQuery(args, api, extraOptions)
        }
        else {
            console.log("Looged out")
            api.dispatch(setLogout())
        }
    }
    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({}),
    tagTypes: ["User", "Chat", "Message", "Group"]
})