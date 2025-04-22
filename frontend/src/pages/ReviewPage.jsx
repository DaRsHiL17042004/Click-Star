// src/pages/ReviewPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const ReviewPage = () => {
  const { photographerId, bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [photographer, setPhotographer] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
    anonymous: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const photographerResponse = await axios.get(`/api/photographers/${photographerId}`);
        setPhotographer(photographerResponse.data);

        const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
        setBooking(bookingResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load review page data");
        setLoading(false);
      }
    };

    fetchData();
  }, [photographerId, bookingId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.rating) newErrors.rating = "Rating is required";
    if (!formData.comment.trim()) newErrors.comment = "Please provide some feedback";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      const reviewData = {
        photographerId,
        clientId: user?._id, // Assuming MongoDB uses _id
        bookingId,
        rating: Number(formData.rating),
        comment: formData.comment,
        anonymous: formData.anonymous,
      };

      await axios.post("/api/reviews", reviewData);

      toast.success("Review submitted successfully!");
      navigate("/client-dashboard/reviews");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="pt-24 pb-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  Review Your Session with {photographer?.name}
                </h2>

                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center mr-4">
                      {photographer?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{photographer?.name}</h3>
                      <p className="text-gray-400">
                        {booking?.type} on {new Date(booking?.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Rating Stars */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                          className="text-3xl focus:outline-none"
                        >
                          <span className={star <= formData.rating ? "text-yellow-400" : "text-gray-600"}>★</span>
                        </button>
                      ))}
                    </div>
                    {errors.rating && <p className="mt-1 text-sm text-red-500">{errors.rating}</p>}
                  </div>

                  {/* Comment */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Your Review</label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Share your experience with this photographer..."
                      className={`w-full px-4 py-2 bg-gray-700 border ${
                        errors.comment ? "border-red-500" : "border-gray-600"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    ></textarea>
                    {errors.comment && <p className="mt-1 text-sm text-red-500">{errors.comment}</p>}
                  </div>

                  {/* Anonymous checkbox */}
                  <div className="mb-8">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="anonymous"
                        name="anonymous"
                        checked={formData.anonymous}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="anonymous" className="text-sm">
                        Post anonymously
                      </label>
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium transition-transform transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
                    >
                      {submitting ? (
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
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReviewPage;
