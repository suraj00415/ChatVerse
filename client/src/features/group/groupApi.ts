import { apiSlice } from "./../chat/api/apiSlice";

export const groupApi = apiSlice.injectEndpoints({
    endpoints: builder => ({
        addAdmins: builder.mutation({
            query: (formData) => {
                return {
                    url: '/groups/add-admins',
                    method: "POST",
                    body: formData,
                    formData: true
                }
            },
            invalidatesTags: ["Chat", "Group"]
        }),
        renameGroupChat: builder.mutation({
            query: (formData) => {
                return {
                    url: "/groups/rename-group",
                    method: "POST",
                    body: formData,
                    formData: true,
                }
            },
            invalidatesTags:["Chat","Group"]
        }),
        updateGroupAvatar: builder.mutation({
            query: (formData, chatId) => {
                const formDataBody = new FormData()
                Object.keys(formData).forEach((key) => {
                    formDataBody.append(key, formData[key])
                })
                return {
                    url: `/groups/update-group-avatar/${chatId}`,
                    method: "PATCH",
                    body: formDataBody,
                    formData: true,
                }
            }
        })
    })
})

export const { useAddAdminsMutation, useRenameGroupChatMutation, useUpdateGroupAvatarMutation } = groupApi