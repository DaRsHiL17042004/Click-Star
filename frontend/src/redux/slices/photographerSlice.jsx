import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

// Async thunks
export const fetchPhotographerProfile = createAsyncThunk("photographer/fetchProfile", async (photographerId) => {
  const response = await axios.get(`/api/photographer/${photographerId}`)
  return response.data
})

export const updatePhotographerProfile = createAsyncThunk(
  "photographer/updateProfile",
  async ({ photographerId, profileData }) => {
    const response = await axios.put(`/api/photographer/${photographerId}`, profileData)
    return response.data
  },
)

export const uploadPortfolioImage = createAsyncThunk(
  "photographer/uploadPortfolioImage",
  async ({ photographerId, image }) => {
    const formData = new FormData()
    formData.append("image", image)

    const response = await axios.post(`/api/photographer/${photographerId}/portfolio`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
)

export const deletePortfolioImage = createAsyncThunk(
  "photographer/deletePortfolioImage",
  async ({ photographerId, imageId }) => {
    await axios.delete(`/api/photographer/${photographerId}/portfolio/${imageId}`)
    return imageId
  },
)

const photographerSlice = createSlice({
  name: "photographer",
  initialState: {
    profile: null,
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchPhotographerProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPhotographerProfile.fulfilled, (state, action) => {
        state.profile = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(fetchPhotographerProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Update profile
      .addCase(updatePhotographerProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      // Upload portfolio image
      .addCase(uploadPortfolioImage.fulfilled, (state, action) => {
        if (!state.profile.portfolio) {
          state.profile.portfolio = []
        }
        state.profile.portfolio.push(action.payload)
      })
      // Delete portfolio image
      .addCase(deletePortfolioImage.fulfilled, (state, action) => {
        state.profile.portfolio = state.profile.portfolio.filter((image) => image.id !== action.payload)
      })
  },
})

export default photographerSlice.reducer
