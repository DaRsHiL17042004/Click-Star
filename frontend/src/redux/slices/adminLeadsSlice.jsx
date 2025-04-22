import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "react-toastify"

// Async thunks
export const fetchLeads = createAsyncThunk("adminLeads/fetchLeads", async () => {
  const response = await axios.get("/api/admin/leads")
  return response.data
})

export const createLead = createAsyncThunk("adminLeads/createLead", async (leadData) => {
  const response = await axios.post("/api/admin/lead", leadData)
  return response.data
})

export const updateLeadStatus = createAsyncThunk("adminLeads/updateStatus", async ({ leadId, status }) => {
  await axios.put(`/api/admin/lead/status`, { leadId, status })
  return { leadId, status }
})

const adminLeadsSlice = createSlice({
  name: "adminLeads",
  initialState: {
    items: [],
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Create lead
      .addCase(createLead.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        toast.success("Lead created successfully")
      })
      .addCase(createLead.rejected, (state) => {
        toast.error("Failed to create lead")
      })
      // Update lead status
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        const { leadId, status } = action.payload
        const lead = state.items.find((lead) => lead.id === leadId)
        if (lead) {
          lead.status = status
        }
        toast.success(`Lead status updated to ${status}`)
      })
      .addCase(updateLeadStatus.rejected, (state) => {
        toast.error("Failed to update lead status")
      })
  },
})

export default adminLeadsSlice.reducer
