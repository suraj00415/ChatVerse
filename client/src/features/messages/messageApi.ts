import { apiSlice } from "../api/apiSlice";

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
    })
})

export const { useGetMessageQuery, useSendMessageMutation } = messageSlice