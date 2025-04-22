import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "react-toastify"

// Async thunks
export const fetchPhotographerBookings = createAsyncThunk(
  "bookings/fetchPhotographerBookings",
  async (photographerId) => {
    const response = await axios.get(`/api/bookings/photographer/${photographerId}`)
    return response.data
  },
)

export const updateBookingStatus = createAsyncThunk("bookings/updateStatus", async ({ bookingId, status }) => {
  await axios.put(`/api/bookings/${bookingId}/status`, { status })
  return { bookingId, status }
})

const bookingsSlice = createSlice({
  name: "bookings",
  initialState: {
    items: [],
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch bookings
      .addCase(fetchPhotographerBookings.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPhotographerBookings.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(fetchPhotographerBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Update booking status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { bookingId, status } = action.payload
        const booking = state.items.find((booking) => booking.id === bookingId)
        if (booking) {
          booking.status = status
        }
        toast.success(`Booking ${status}`)
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        toast.error("Failed to update booking status")
      })
  },
})

export default bookingsSlice.reducer
