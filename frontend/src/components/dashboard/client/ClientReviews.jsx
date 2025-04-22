

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

const ClientReviews = ({ reviews = [], bookings = [], addReview, loading }) => {
  const [activeTab, setActiveTab] = useState("submitted")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    bookingId: "",
    rating: 5,
    comment: "",
    anonymous: false,
  })

  // Filter completed bookings that haven't been reviewed yet
  const pendingReviews = bookings.filter(
    (booking) =>
      booking.status === "completed" && !booking.reviewed && !reviews.some((r) => r.bookingId === booking.id),
  )

  // Filter reviews based on active tab
  const displayedReviews = activeTab === "submitted" ? reviews : pendingReviews

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setReviewForm({
      ...reviewForm,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!reviewForm.bookingId) {
      alert("Please select a booking to review")
      return
    }

    if (!reviewForm.comment.trim()) {
      alert("Please provide a comment for your review")
      return
    }

    setIsSubmitting(true)

    try {
      const booking = bookings.find((b) => b.id === reviewForm.bookingId)

      const reviewData = {
        bookingId: reviewForm.bookingId,
        photographerId: booking.photographer.id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
        anonymous: reviewForm.anonymous,
      }

      await addReview(reviewData)

      // Reset form
      setReviewForm({
        bookingId: "",
        rating: 5,
        comment: "",
        anonymous: false,
      })

      // Switch to submitted tab
      setActiveTab("submitted")
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
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
      <h2 className="text-3xl font-bold mb-8">My Reviews</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("submitted")}
          className={`px-4 py-2 font-medium ${
            activeTab === "submitted"
              ? "border-b-2 border-purple-500 text-purple-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Submitted Reviews
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium ${
            activeTab === "pending" ? "border-b-2 border-purple-500 text-purple-500" : "text-gray-400 hover:text-white"
          }`}
        >
          Pending Reviews {pendingReviews.length > 0 && `(${pendingReviews.length})`}
        </button>
      </div>

      {activeTab === "submitted" && (
        <>
          {reviews.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">No reviews submitted yet</h3>
              <p className="text-gray-400 mb-6">
                After you complete a booking, you can leave a review for the photographer.
              </p>
              <button
                onClick={() => setActiveTab("pending")}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-block"
              >
                See Pending Reviews
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex items-start mb-4 md:mb-0">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center mr-4">
                          {review.photographer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{review.photographer.name}</h3>
                          <p className="text-gray-400">
                            {review.booking?.type || "Photography Session"} on{" "}
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
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

                    <div className="border-t border-gray-700 my-4 pt-4">
                      <p className="text-gray-300">{review.comment}</p>
                      {review.anonymous && <p className="text-gray-400 text-sm mt-2">Posted anonymously</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "pending" && (
        <>
          {pendingReviews.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">No pending reviews</h3>
              <p className="text-gray-400 mb-6">You've reviewed all your completed bookings. Great job!</p>
              <Link
                to="/search"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-block"
              >
                Find More Photographers
              </Link>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Leave a Review</h3>

              <form onSubmit={handleSubmitReview}>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Booking</label>
                  <select
                    name="bookingId"
                    value={reviewForm.bookingId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select a booking to review</option>
                    {pendingReviews.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.photographer.name} - {booking.type} on {new Date(booking.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                {reviewForm.bookingId && (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Your Rating</label>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="text-3xl focus:outline-none"
                          >
                            <span className={star <= reviewForm.rating ? "text-yellow-400" : "text-gray-600"}>★</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <textarea
                        name="comment"
                        value={reviewForm.comment}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Share your experience with this photographer..."
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      ></textarea>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="anonymous"
                          name="anonymous"
                          checked={reviewForm.anonymous}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label htmlFor="anonymous" className="text-sm">
                          Post anonymously
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium transition-transform transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                            Submitting...
                          </span>
                        ) : (
                          "Submit Review"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

export default ClientReviews
