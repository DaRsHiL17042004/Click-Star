import { configureStore } from "@reduxjs/toolkit"
import photographerReducer from "./slices/photographerSlice"
import bookingsReducer from "./slices/bookingsSlice"
import reviewsReducer from "./slices/reviewsSlice"

import adminLeadsReducer from "./slices/adminLeadsSlice"
import adminUsersReducer from "./slices/adminUsersSlice"
import adminStatsReducer from "./slices/adminStatsSlice"

export const store = configureStore({
  reducer: {
    photographer: photographerReducer,
    bookings: bookingsReducer,
    reviews: reviewsReducer,

    adminLeads: adminLeadsReducer,
    adminUsers: adminUsersReducer,
    adminStats: adminStatsReducer,
  },
})
