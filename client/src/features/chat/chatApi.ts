import { apiSlice } from "./api/apiSlice";

export const chatSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAllChat: builder.query({
            query: () => ({
                url: '/chats/get-all-chats',
            }),
            providesTags: ["Chat", "Group"]
        }),
        createOneChat: builder.mutation({
            query: (id) => ({
                url: `/chats/create-one-chat/${id}`,
                method: 'POST'
            }),
            invalidatesTags: ["Chat", "Group"]
        }),
        searchAvailableUsers: builder.query({
            query: (query) => {
                if (!query) query = " "
                return { url: `/chats/get-all-users/${query}`, method: 'GET' }
            },
            providesTags: ["Chat", "Group", "User"]
        }),
        createGroup: builder.mutation({
            query: (formData) => {
                const formDataBody = new FormData();
                Object.keys(formData).forEach(key => {
                    formDataBody.append(key, formData[key]);
                });
                return {
                    url: '/chats/create-group',
                    method: 'POST',
                    body: formDataBody,
                    formData: true,
                };
            },
            invalidatesTags: ["Chat", "Message"]
        }),
        addParticipants: builder.mutation({
            query: (formData) => {
                const formDataBody = new FormData();
                Object.keys(formData).forEach(key => {
                    formDataBody.append(key, formData[key]);
                });
                return {
                    url: '/chats/participants/add',
                    method: "POST",
                    body: formData,
                    formData: true
                }
            },
            invalidatesTags: ["Chat", "Group"]
        }),
        removeParticipants: builder.mutation({
            query: (formData) => {
                return {
                    url: '/chats/participants/remove',
                    method: "DELETE",
                    body: formData,
                    formData: true
                }
            },
            invalidatesTags: ["Chat", "Group"]
        }),
        leaveGroup: builder.mutation({
            query: (id) => ({
                url: `/chats/leave-group/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ["Chat", "Group"]
        }),
        deleteGroup: builder.mutation({
            query: (id) => ({
                url: `/chats/delete-group/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ["Chat", "Group"]
        })
    })
})

export const { useGetAllChatQuery, useCreateGroupMutation, useSearchAvailableUsersQuery, useCreateOneChatMutation, useAddParticipantsMutation, useLeaveGroupMutation, useRemoveParticipantsMutation, useDeleteGroupMutation } = chatSlice