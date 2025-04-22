import { useState, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-toastify"

// Dashboard Components
import DashboardLayout from "../../components/dashboard/DashboardLayout"
import PhotographerProfile from "../../components/dashboard/photographer/PhotographerProfile"
import PhotographerPortfolio from "../../components/dashboard/photographer/PhotographerPortfolio"
import PhotographerBookings from "../../components/dashboard/photographer/PhotographerBookings"
import PhotographerReviews from "../../components/dashboard/photographer/PhotographerReviews"
import PhotographerStats from "../../components/dashboard/photographer/PhotographerStats"

const PhotographerDashboard = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState({
    profile: true,
    bookings: true,
    reviews: true,
  })
  const location = useLocation()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch photographer profile
        const profileResponse = await axios.get(`/api/photographer/${user.id}`)
        setProfile(profileResponse.data)
        setLoading((prev) => ({ ...prev, profile: false }))

        // Fetch bookings
        const bookingsResponse = await axios.get(`/api/bookings/photographer/${user.id}`)
        setBookings(bookingsResponse.data)
        
        setLoading((prev) => ({ ...prev, bookings: false }))

        // Fetch reviews
        const reviewsResponse = await axios.get(`/api/reviews/${user.id}`)
        setReviews(reviewsResponse.data)
        setLoading((prev) => ({ ...prev, reviews: false }))
      } catch (error) {
        console.error("Error fetching photographer data:", error)
        toast.error("Failed to load dashboard data")
        setLoading({
          profile: false,
          bookings: false,
          reviews: false,
        })
      }
    }

    fetchData()
  }, [user])

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`/api/photographer/${user.id}`, profileData)
      setProfile(response.data)
      toast.success("Profile updated successfully")
      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
      return false
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status })

      // Update local state
      setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)))

      toast.success(`Booking ${status}`)
      return true
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast.error("Failed to update booking status")
      return false
    }
  }

  const uploadPortfolioImage = async (image) => {
    try {
      const formData = new FormData()
      formData.append("image", image)

      const response = await axios.post(`/api/photographer/${user.id}/portfolio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Update profile with new portfolio image
      setProfile({
        ...profile,
        portfolio: [...profile.portfolio, response.data],
      })

      toast.success("Image uploaded successfully")
      return true
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
      return false
    }
  }

  const deletePortfolioImage = async (imageId) => {
    try {
      await axios.delete(`/api/photographer/${user.id}/portfolio/${imageId}`)

      // Update profile by removing the deleted image
      setProfile({
        ...profile,
        portfolio: profile.portfolio.filter((img) => img.id !== imageId),
      })

      toast.success("Image deleted successfully")
      return true
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Failed to delete image")
      return false
    }
  }

  const navItems = [
    { path: "", label: "Overview", icon: "📊" },
    { path: "profile", label: "Profile", icon: "👤" },
    { path: "portfolio", label: "Portfolio", icon: "🖼️" },
    { path: "bookings", label: "Bookings", icon: "📅" },
    { path: "reviews", label: "Reviews", icon: "⭐" },
  ]

  return (
    <DashboardLayout title="Photographer Dashboard" navItems={navItems} userRole="photographer">
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              <PhotographerStats bookings={bookings} reviews={reviews} loading={loading.bookings || loading.reviews} />
            }
          />
          <Route
            path="profile"
            element={<PhotographerProfile profile={profile} updateProfile={updateProfile} loading={loading.profile} />}
          />
          <Route
            path="portfolio"
            element={
              <PhotographerPortfolio
                portfolio={profile?.portfolio || []}
                uploadImage={uploadPortfolioImage}
                deleteImage={deletePortfolioImage}
                loading={loading.profile}
              />
            }
          />
          <Route
            path="bookings"
            element={
              <PhotographerBookings bookings={bookings} updateStatus={updateBookingStatus} loading={loading.bookings} />
            }
          />
          <Route path="reviews" element={<PhotographerReviews reviews={reviews} loading={loading.reviews} />} />
        </Routes>
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default PhotographerDashboard
