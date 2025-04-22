import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

// Async thunks
export const fetchAdminStats = createAsyncThunk("adminStats/fetchStats", async () => {
  const response = await axios.get("/api/admin/stats")
  return response.data
})

const adminStatsSlice = createSlice({
  name: "adminStats",
  initialState: {
    data: null,
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.data = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default adminStatsSlice.reducer
