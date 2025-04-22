"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"

const PhotographerReviews = ({ loading }) => {
  const { items: reviews } = useSelector((state) => state.reviews)

  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  // Filter reviews based on active tab
  const filteredReviews =
    activeTab === "all"
      ? reviews
      : reviews.filter((review) => {
          if (activeTab === "positive") return review.rating >= 4
          if (activeTab === "neutral") return review.rating === 3
          if (activeTab === "negative") return review.rating <= 2
          return true
        })

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt) - new Date(a.createdAt)
    }
    if (sortBy === "rating-high") {
      return b.rating - a.rating
    }
    if (sortBy === "rating-low") {
      return a.rating - b.rating
    }
    return 0
  })

  // Calculate average rating
  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "N/A"

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
    return { rating, count, percentage }
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="text-3xl font-bold mb-8">Reviews & Ratings</h2>

      {reviews.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">⭐</div>
          <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
          <p className="text-gray-400">Once clients leave reviews, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Rating Summary */}
          <div className="bg-gray-800 rounded-lg p-6 lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">Rating Summary</h3>

            <div className="flex items-center justify-center mb-6">
              <div className="text-5xl font-bold text-yellow-400 mr-3">{averageRating}</div>
              <div>
                <div className="flex text-yellow-400 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-600"}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-400">Based on {reviews.length} reviews</div>
              </div>
            </div>

            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center">
                  <div className="w-12 text-sm">{item.rating} stars</div>
                  <div className="flex-1 mx-3">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                  <div className="w-8 text-sm text-right">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div className="flex mb-4 md:mb-0">
                {[
                  { id: "all", label: "All Reviews" },
                  { id: "positive", label: "Positive" },
                  { id: "neutral", label: "Neutral" },
                  { id: "negative", label: "Negative" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`mr-4 text-sm font-medium ${
                      activeTab === tab.id
                        ? "text-purple-500 border-b-2 border-purple-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-2">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="date">Most Recent</option>
                  <option value="rating-high">Highest Rating</option>
                  <option value="rating-low">Lowest Rating</option>
                </select>
              </div>
            </div>

            {sortedReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No reviews match your filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                          {review.anonymous ? "A" : review.client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{review.anonymous ? "Anonymous" : review.client.name}</p>
                          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= review.rating ? "text-yellow-400" : "text-gray-600"}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300">{review.comment}</p>
                    {review.booking && (
                      <div className="mt-3 text-xs text-gray-400">
                        <span className="bg-gray-600 px-2 py-1 rounded-full">{review.booking.type}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default PhotographerReviews
