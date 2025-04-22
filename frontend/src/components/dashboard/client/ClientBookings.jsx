
import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

const ClientBookings = ({ bookings = [], cancelBooking, loading }) => {
  const [activeTab, setActiveTab] = useState("all")
  const [isCancelling, setIsCancelling] = useState(null)

  const filteredBookings = activeTab === "all" ? bookings : bookings.filter((booking) => booking.status === activeTab)
  
  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setIsCancelling(bookingId)
      try {
        await cancelBooking(bookingId)
      } finally {
        setIsCancelling(null)
      }
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
      <h2 className="text-3xl font-bold mb-8">My Bookings</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
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
            className={`px-4 py-2 font-medium whitespace-nowrap ${
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
          <p className="text-gray-400 mb-6">
            {activeTab === "all" ? "You don't have any bookings yet." : `You don't have any ${activeTab} bookings.`}
          </p>
          <Link
            to="/search"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-block"
          >
            Find Photographers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex items-start mb-4 md:mb-0">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center mr-4">
                      {booking.photographer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{booking.photographer.name}</h3>
                      <p className="text-gray-400">{booking.photographer.location}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <p className="text-gray-400 mt-1">Booked on {new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border-t border-gray-700 my-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Date & Time</p>
                      <p className="font-medium">
                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Shoot Type</p>
                      <p className="font-medium">{booking.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="font-medium">{booking.location}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-400 text-sm">Details</p>
                    <p className="text-gray-300">{booking.details || "No additional details provided."}</p>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 text-sm">Price</p>
                      <p className="text-xl font-bold">${booking.price.toFixed(2)}</p>
                    </div>

                    <div className="flex space-x-3">
                      {booking.status === "completed" && !booking.reviewed && (
                        <Link
                          to={`/review/${booking.photographer.id}/${booking.id}`}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        >
                          Leave Review
                        </Link>
                      )}

                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={isCancelling === booking.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-70"
                        >
                          {isCancelling === booking.id ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                              Cancelling...
                            </span>
                          ) : (
                            "Cancel Booking"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default ClientBookings
