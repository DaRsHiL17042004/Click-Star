"use client"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"

const PhotographerStats = ({ loading }) => {
  const { items: bookings } = useSelector((state) => state.bookings)
  const { items: reviews } = useSelector((state) => state.reviews)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Calculate stats
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed").length
  const completedBookings = bookings.filter((booking) => booking.status === "completed").length

  const totalReviews = reviews.length
  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "N/A"

  // Calculate earnings (assuming each booking has a price field)
  const totalEarnings = bookings
    .filter((booking) => booking.status === "completed")
    .reduce((sum, booking) => sum + (booking.price || 0), 0)

  // Recent bookings and reviews
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const recentReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Bookings", value: totalBookings, icon: "📅", color: "from-blue-500 to-blue-700" },
          { title: "Pending Bookings", value: pendingBookings, icon: "⏳", color: "from-yellow-500 to-yellow-700" },
          { title: "Average Rating", value: averageRating, icon: "⭐", color: "from-purple-500 to-purple-700" },
          {
            title: "Total Earnings",
            value: `${totalEarnings.toFixed(2)}`,
            icon: "💰",
            color: "from-green-500 to-green-700",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`bg-gradient-to-r ${stat.color} rounded-lg p-6 shadow-lg`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-white text-3xl font-bold">{stat.value}</h3>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Booking Status</h3>
            <Link to="/photographer-dashboard/bookings" className="text-purple-400 hover:text-purple-300 text-sm">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
              <div className="flex h-full">
                <div
                  className="bg-yellow-500 h-full"
                  style={{ width: `${(pendingBookings / Math.max(totalBookings, 1)) * 100}%` }}
                ></div>
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${(confirmedBookings / Math.max(totalBookings, 1)) * 100}%` }}
                ></div>
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${(completedBookings / Math.max(totalBookings, 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span>Pending ({pendingBookings})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Confirmed ({confirmedBookings})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Completed ({completedBookings})</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Reviews</h3>
            <Link to="/photographer-dashboard/reviews" className="text-purple-400 hover:text-purple-300 text-sm">
              View All
            </Link>
          </div>

          {recentReviews.length > 0 ? (
            <div className="space-y-4">
              {recentReviews.map((review, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                        {review.client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{review.client.name}</p>
                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No reviews yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-gray-800 rounded-lg p-6 shadow-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Recent Bookings</h3>
          <Link to="/photographer-dashboard/bookings" className="text-purple-400 hover:text-purple-300 text-sm">
            View All
          </Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                          {booking.client.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{booking.client.name}</span>
                      </div>
                    </td>
                    <td className="py-4">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="py-4">{booking.type}</td>
                    <td className="py-4">${booking.price.toFixed(2)}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : booking.status === "confirmed"
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No bookings yet</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default PhotographerStats
