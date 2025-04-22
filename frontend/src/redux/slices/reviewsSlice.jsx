import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

// Async thunks
export const fetchPhotographerReviews = createAsyncThunk("reviews/fetchPhotographerReviews", async (photographerId) => {
  const response = await axios.get(`/api/reviews/${photographerId}`)
  return response.data
})

const reviewsSlice = createSlice({
  name: "reviews",
  initialState: {
    items: [],
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchPhotographerReviews.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPhotographerReviews.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(fetchPhotographerReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default reviewsSlice.reducer
