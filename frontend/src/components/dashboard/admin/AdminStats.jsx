"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"

const AdminStats = () => {
  const { data: stats, loading } = useSelector((state) => state.adminStats)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // If stats is null, show placeholder data
  if (!stats) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold mb-2">Unable to load statistics</h3>
        <p className="text-gray-400">Please try again later.</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Users",
            value: stats.totalUsers,
            icon: "👥",
            color: "from-blue-500 to-blue-700",
            change: stats.userGrowth,
          },
          {
            title: "Total Bookings",
            value: stats.totalBookings,
            icon: "📅",
            color: "from-green-500 to-green-700",
            change: stats.bookingGrowth,
          },
          {
            title: "Total Revenue",
            value: `${stats.totalRevenue.toFixed(2)}`,
            icon: "💰",
            color: "from-yellow-500 to-yellow-700",
            change: stats.revenueGrowth,
          },
          {
            title: "Active Photographers",
            value: stats.activePhotographers,
            icon: "📸",
            color: "from-purple-500 to-purple-700",
            change: stats.photographerGrowth,
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
                <p className="text-white/80 text-sm mt-2 flex items-center">
                  {stat.change >= 0 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  )}
                  {Math.abs(stat.change)}% from last month
                </p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Users */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Users</h3>
            <Link to="/admin-dashboard/users" className="text-purple-400 hover:text-purple-300 text-sm">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "photographer"
                            ? "bg-blue-500/20 text-blue-500"
                            : user.role === "admin"
                              ? "bg-red-500/20 text-red-500"
                              : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Bookings</h3>
            <Link to="/admin-dashboard/bookings" className="text-purple-400 hover:text-purple-300 text-sm">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Photographer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((booking, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                          {booking.client.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{booking.client.name}</span>
                      </div>
                    </td>
                    <td className="py-3">{booking.photographer.name}</td>
                    <td className="py-3">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : booking.status === "confirmed"
                              ? "bg-blue-500/20 text-blue-500"
                              : booking.status === "completed"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
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
        </motion.div>
      </div>

      {/* User Distribution and Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Distribution */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold mb-6">User Distribution</h3>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-xs">
              {/* Simple pie chart representation */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-500/20 text-blue-500">
                      Photographers
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-500">
                      {stats.userDistribution.photographers}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                  <div
                    style={{ width: `${stats.userDistribution.photographers}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>

              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-500/20 text-green-500">
                      Clients
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-500">
                      {stats.userDistribution.clients}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                  <div
                    style={{ width: `${stats.userDistribution.clients}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>

              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-500/20 text-red-500">
                      Admins
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-red-500">
                      {stats.userDistribution.admins}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                  <div
                    style={{ width: `${stats.userDistribution.admins}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold mb-6">Monthly Revenue</h3>

          <div className="h-64 flex items-end justify-between px-2">
            {stats.monthlyRevenue.map((month, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-8 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t"
                  style={{ height: `${(month.amount / stats.maxMonthlyRevenue) * 100}%` }}
                ></div>
                <div className="text-xs mt-2 text-gray-400">{month.month}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AdminStats
