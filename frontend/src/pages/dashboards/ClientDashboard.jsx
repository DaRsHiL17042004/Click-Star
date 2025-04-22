
import { useState, useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-toastify"

// Dashboard Components
import DashboardLayout from "../../components/dashboard/DashboardLayout"
import ClientProfile from "../../components/dashboard/client/ClientProfile"
import ClientBookings from "../../components/dashboard/client/ClientBookings"
import ClientReviews from "../../components/dashboard/client/ClientReviews"
import ClientFavorites from "../../components/dashboard/client/ClientFavorites"
  
const ClientDashboard = () => {
  const user  = useAuth()
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState({
    profile: true,
    bookings: true,
    reviews: true,
    favorites: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch client profile
        const profileResponse = await axios.get(`http://localhost:5000/api/client/${user.id}`)
        setProfile(profileResponse.data)
        setLoading((prev) => ({ ...prev, profile: false }))

        // Fetch bookings
        const bookingsResponse = await axios.get(`http://localhost:5000/api/bookings/client/${user.id}`)
        setBookings(bookingsResponse.data)
        setLoading((prev) => ({ ...prev, bookings: false }))

        // Fetch reviews
        const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/client/${user.id}`)
        setReviews(reviewsResponse.data)
        setLoading((prev) => ({ ...prev, reviews: false }))

        // Fetch favorites
        const favoritesResponse = await axios.get(`http://localhost:5000/api/client/${user.id}/favorites`)
        setFavorites(favoritesResponse.data)
        setLoading((prev) => ({ ...prev, favorites: false }))
      } catch (error) {
        console.error("Error fetching client data:", error.stack)
        toast.error("Failed to load dashboard data")
        setLoading({
          profile: false,
          bookings: false,
          reviews: false,
          favorites: false,
        })
      }
    }

    fetchData()
  }, [user])

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/client/${user.id}`, profileData)
      setProfile(response.data)
      toast.success("Profile updated successfully")
      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
      return false
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`)

      // Update local state
      setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, status: "cancelled" } : booking)))

      toast.success("Booking cancelled")
      return true
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
      return false
    }
  }

  const addReview = async (reviewData) => {
    try {
      const response = await axios.post("http://localhost:5000/api/reviews", reviewData)

      // Add new review to state
      setReviews([response.data, ...reviews])

      // Update booking to mark as reviewed
      setBookings(
        bookings.map((booking) => (booking.id === reviewData.bookingId ? { ...booking, reviewed: true } : booking)),
      )

      toast.success("Review submitted successfully")
      return true
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review")
      return false
    }
  }
  
  const toggleFavorite = async (photographerId) => {
    try {
      const isFavorite = favorites.some((fav) => fav.id === photographerId)

      if (isFavorite) {
        await axios.delete(`http://localhost:5000/api/client/${user.id}/favorites/${photographerId}`)
        setFavorites(favorites.filter((fav) => fav.id !== photographerId))
        toast.success("Removed from favorites")
      } else {
        const response = await axios.post(`http://localhost:5000/api/client/${user.id}/favorites`, { photographerId })
        setFavorites([...favorites, response.data])
        toast.success("Added to favorites")
      }

      return true
    } catch (error) {
      console.error("Error updating favorites:", error)
      toast.error("Failed to update favorites")
      return false
    }
  }

  const navItems = [
    { path: "", label: "Profile", icon: "👤" },
    { path: "bookings", label: "Bookings", icon: "📅" },
    { path: "reviews", label: "Reviews", icon: "⭐" },
    { path: "favorites", label: "Favorites", icon: "❤️" },
  ]

  return (
    <DashboardLayout title="Client Dashboard" navItems={navItems} userRole="client">
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={<ClientProfile profile={profile} updateProfile={updateProfile} loading={loading.profile} />}
          />
          <Route
            path="bookings"
            element={<ClientBookings bookings={bookings} cancelBooking={cancelBooking} loading={loading.bookings} />}
          />
          <Route
            path="reviews"
            element={
              <ClientReviews reviews={reviews} bookings={bookings} addReview={addReview} loading={loading.reviews} />
            }
          />
          <Route
            path="favorites"
            element={
              <ClientFavorites favorites={favorites} toggleFavorite={toggleFavorite} loading={loading.favorites} />
            }
          />
        </Routes>
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default ClientDashboard
