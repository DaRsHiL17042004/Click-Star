import { useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { Canvas } from "@react-three/fiber";
import { Stars, Text, OrbitControls } from "@react-three/drei";
import Footer from "../components/Footer";
import Header from "../components/layout/Header";
import { BACKEND_URL } from "../api/axios";

const ThreeDText = ({ text, position, color }) => {
  return (
    <Text
      position={position}
      color={color}
      fontSize={0.5}
      maxWidth={2}
      lineHeight={1}
      letterSpacing={0.02}
      textAlign="center"
      font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
};

// Photographer Card Component
const PhotographerCard = ({ photographer, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
    >
      <div className="h-48 bg-gray-700 relative">
        {photographer.portfolio && photographer.portfolio.length > 0 ? (
          <img
            src={photographer.portfolio[0].url || "/placeholder.svg"}
            alt={photographer.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-900/30">
            <span className="text-4xl">📸</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-xl font-bold text-white">{photographer.name}</h3>
          <p className="text-gray-300 text-sm">{photographer.location}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.floor(photographer.rating)
                    ? "text-yellow-400"
                    : "text-gray-600"
                }
              >
                ★
              </span>
            ))}
          </div>
          <span className="ml-2 text-gray-400 text-sm">
            ({photographer.reviewCount} reviews)
          </span>
        </div>

        <div className="mb-4">
          <p className="text-gray-400 text-sm line-clamp-2">
            {photographer.bio}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {photographer.photoshootTypes.slice(0, 3).map((specialty, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs"
            >
              {specialty}
            </span>
          ))}
          {photographer.specialties.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">
              +{photographer.specialties.length - 3} more
            </span>
          )}
        </div>
          
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs">Starting at</p>
            <p className="text-white font-bold">
              ${photographer.pricing.hourly}/hr
            </p>
          </div>

          <Link
            to={`/book/${photographer._id}`}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-medium transition-transform hover:scale-105"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const SearchPage = () => {
  const [photographers, setPhotographers] = useState([]);
  const [filteredPhotographers, setFilteredPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    specialty: "",
    minPrice: "",
    maxPrice: "",
    minRating: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Specialties for filter
  const specialties = [
    "Portrait",
    "Wedding",
    "Event",
    "Family",
    "Newborn",
    "Fashion",
    "Product",
    "Real Estate",
    "Landscape",
    "Sports",
  ];

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/photographer/search`)
        setPhotographers(response.data.photographers)
        setFilteredPhotographers(response.data.photographers)
        setLoading(false)
        console.log(response.data.photographers);
        
      } catch (error) {
        console.error("Error fetching photographers:", error)
        toast.error("Failed to load photographers")
        setLoading(false)
      }
    }

    fetchPhotographers()
  }, [])

  const applyFilters = () => {
    let results = [...photographers];

    // Filter by location
    if (filters.location) {
      results = results.filter((photographer) =>
        photographer.location
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    // Filter by specialty
    if (filters.specialty) {
      results = results.filter((photographer) =>
        photographer.specialties.some(
          (s) => s.toLowerCase() === filters.specialty.toLowerCase()
        )
      );
    }

    // Filter by price range
    if (filters.minPrice) {
      results = results.filter(
        (photographer) =>
          photographer.pricing.hourly >= Number.parseInt(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      results = results.filter(
        (photographer) =>
          photographer.pricing.hourly <= Number.parseInt(filters.maxPrice)
      );
    }

    // Filter by rating
    if (filters.minRating > 0) {
      results = results.filter(
        (photographer) => photographer.rating >= filters.minRating
      );
    }

    setFilteredPhotographers(results);
    setNoResults(results.length === 0);
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const resetFilters = () => {
    setFilters({
      location: "",
      specialty: "",
      minPrice: "",
      maxPrice: "",
      minRating: 0,
    });
    setFilteredPhotographers(photographers);
    setNoResults(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Section with 3D */}
          <div className="relative h-64 mb-12 rounded-xl overflow-hidden">
            <div className="absolute inset-0 z-0">
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Suspense fallback={null}>
                  <ThreeDText
                    text="Find Your Perfect Photographer"
                    position={[0, 0, 0]}
                    color="#ffffff"
                  />
                  <Stars
                    radius={100}
                    depth={50}
                    count={5000}
                    factor={4}
                    saturation={0}
                    fade
                    speed={1}
                  />
                </Suspense>
                <OrbitControls
                  enableZoom={false}
                  autoRotate
                  autoRotateSpeed={0.5}
                />
              </Canvas>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
                  Find Your Perfect Photographer
                </h1>
                <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
                  Browse our curated list of professional photographers for your
                  next shoot
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or location..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pl-10"
                    value={filters.location}
                    name="location"
                    onChange={handleFilterChange}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 absolute left-3 top-3.5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                </button>

                <button
                  onClick={applyFilters}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Specialty
                      </label>
                      <select
                        name="specialty"
                        value={filters.specialty}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">All Specialties</option>
                        {specialties.map((specialty, index) => (
                          <option key={index} value={specialty}>
                            {specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Min Price ($/hr)
                      </label>
                      <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder="Min"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Max Price ($/hr)
                      </label>
                      <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder="Max"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Min Rating
                      </label>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() =>
                              setFilters({ ...filters, minRating: rating })
                            }
                            className={`text-2xl ${
                              rating <= filters.minRating
                                ? "text-yellow-400"
                                : "text-gray-600"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : noResults ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">😕</div>
              <h3 className="text-2xl font-bold mb-2">
                No photographers found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotographers?.map((photographer, index) => (
                <PhotographerCard
                  key={photographer._id}
                  photographer={photographer}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;
