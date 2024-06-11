import { apiSlice } from "../chat/api/apiSlice";

export const messageSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMessage: builder.query({
            query: (chatId) => {
                if (!chatId) return ""
                return { url: `/messages/get-message/${chatId}` }
            },
            providesTags: []
        }),
        sendMessage: builder.mutation({
            query: (formData) => {
                const formDataBody = new FormData();
                Object.keys(formData).forEach(key => {
                    formDataBody.append(key, formData[key]);
                });
                return {
                    url: '/messages/send-message',
                    method: 'POST',
                    body: formDataBody,
                    formData: true,
                };
            },
            invalidatesTags: ["Message", "Chat"]
        }),
        replyMessage: builder.mutation({
            query: (formData) => {
                const formDataBody = new FormData();
                Object.keys(formData).forEach(key => {
                    formDataBody.append(key, formData[key]);
                });
                return {
                    url: '/messages/reply-message',
                    method: 'POST',
                    body: formDataBody,
                    formData: true,
                };
            },
            invalidatesTags: ["Message", "Chat"]
        }),
        forwardMessage: builder.mutation({
            query: (formData) => {
                return {
                    url: '/messages/forward-message',
                    method: 'POST',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: ["Message", "Chat"]
        }),
        deleteForMe: builder.mutation({
            query: (formData) => {
                return {
                    url: '/messages/delete-for-me',
                    method: 'DELETE',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: ["Message", "Chat"]
        }),
        deleteForEveryone: builder.mutation({
            query: (formData) => {
                return {
                    url: '/messages/delete-for-everyone',
                    method: 'DELETE',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: ["Message", "Chat"]
        }),
    })
})

export const { useGetMessageQuery, useDeleteForEveryoneMutation, useDeleteForMeMutation, useSendMessageMutation, useReplyMessageMutation, useForwardMessageMutation } = messageSlice