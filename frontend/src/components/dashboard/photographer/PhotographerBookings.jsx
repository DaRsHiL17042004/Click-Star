"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { updateBookingStatus } from "../../../redux/slices/bookingsSlice"

const PhotographerBookings = ({ loading }) => {
  const dispatch = useDispatch()
  const { items: bookings } = useSelector((state) => state.bookings)

  const [activeTab, setActiveTab] = useState("all")
  const [isUpdating, setIsUpdating] = useState(null)

  const filteredBookings = activeTab === "all" ? bookings : bookings.filter((booking) => booking.status === activeTab)

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setIsUpdating(bookingId)
    try {
      await dispatch(updateBookingStatus({ bookingId, status: newStatus })).unwrap()
    } catch (error) {
      console.error("Error updating booking status:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500"
      case "confirmed":
        return "bg-blue-500/20 text-blue-500"
      case "completed":
        return "bg-green-500/20 text-green-500"
      case "cancelled":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="text-3xl font-bold mb-8">Manage Bookings</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        {[
          { id: "all", label: "All Bookings" },
          { id: "pending", label: "Pending" },
          { id: "confirmed", label: "Confirmed" },
          { id: "completed", label: "Completed" },
          { id: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.id ? "border-b-2 border-purple-500 text-purple-500" : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-bold mb-2">No bookings found</h3>
          <p className="text-gray-400">
            {activeTab === "all" ? "You don't have any bookings yet." : `You don't have any ${activeTab} bookings.`}
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                          {booking.client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{booking.client.name}</div>
                          <div className="text-sm text-gray-400">{booking.client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{new Date(booking.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-400">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{booking.type}</div>
                      <div className="text-sm text-gray-400">{booking.duration} hour(s)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{booking.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">${booking.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isUpdating === booking.id ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin h-5 w-5 text-white mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Updating...
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-xs font-medium transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-xs font-medium transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, "completed")}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-xs font-medium transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          {booking.status === "completed" && (
                            <span className="text-gray-400 text-xs">No actions available</span>
                          )}
                          {booking.status === "cancelled" && (
                            <span className="text-gray-400 text-xs">No actions available</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default PhotographerBookings
