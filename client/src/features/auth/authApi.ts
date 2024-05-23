import { apiSlice } from "../chat/api/apiSlice";

export const authSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/users/login',
                method: 'POST',
                body: credentials
            }),
            invalidatesTags: ["User"]
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/users/logout',
                method: 'POST'
            }),
            invalidatesTags: ["User"]
        }),
        registerUser: builder.mutation({
            query: (formData) => {
                const formDataBody = new FormData();
                Object.keys(formData).forEach(key => {
                    formDataBody.append(key, formData[key]);
                });
                return {
                    url: '/users/register',
                    method: 'POST',
                    body: formDataBody,
                    formData: true,
                };
            },
            invalidatesTags: ["User"]
        }),
        updateAccount: builder.mutation({
            query: (formData) => ({
                url: '/users/update-account',
                body: formData
            }),
            invalidatesTags: ["User"]
        }),
        updateAvatar: builder.mutation({
            query: (formData) => {
                const formDataBody = new FormData();
                Object.keys(formData).forEach(key => {
                    formDataBody.append(key, formData[key]);
                });
                return {
                    url: '/users/avatar-mage',
                    method: 'POST',
                    body: formDataBody,
                    formData: true,
                };
            },
            invalidatesTags: ["User"]
        }),
        updateCoverImage: builder.mutation({
            query: (formData) => {
                const formDataBody = new FormData();
                Object.keys(formData).forEach(key => {
                    formDataBody.append(key, formData[key]);
                });
                return {
                    url: '/users/cover-image',
                    method: 'POST',
                    body: formDataBody,
                    formData: true,
                };
            },
            invalidatesTags: ["User"]
        }),
        verifyUser: builder.mutation({
            query: (token) => {
                return {
                    url: '/users/verify-email',
                    method: 'POST',
                    body: { emailtoken: token },
                };
            },
            invalidatesTags: ["User"]
        }),
        resendVerifyUser: builder.mutation({
            query: () => {
                return {
                    url: '/users/resend/verify-email',
                    method: 'POST',
                };
            },
            invalidatesTags: ["User"]
        })
    })
})

export const { useLoginMutation, useLogoutMutation, useRegisterUserMutation, useUpdateAccountMutation, useUpdateAvatarMutation, useUpdateCoverImageMutation, useVerifyUserMutation, useResendVerifyUserMutation } = authSlice