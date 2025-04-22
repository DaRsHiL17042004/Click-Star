import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "react-toastify"

// Async thunks
export const fetchUsers = createAsyncThunk("adminUsers/fetchUsers", async () => {
  const response = await axios.get("/api/admin/users")
  return response.data
})

export const updateUserStatus = createAsyncThunk("adminUsers/updateStatus", async ({ userId, active }) => {
  await axios.put(`/api/admin/users/${userId}/status`, { active })
  return { userId, active }
})

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState: {
    items: [],
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { userId, active } = action.payload
        const user = state.items.find((user) => user.id === userId)
        if (user) {
          user.active = active
        }
        toast.success(`User status updated to ${active ? "active" : "inactive"}`)
      })
      .addCase(updateUserStatus.rejected, (state) => {
        toast.error("Failed to update user status")
      })
  },
})

export default adminUsersSlice.reducer
