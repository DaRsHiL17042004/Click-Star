

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

const ClientFavorites = ({ favorites = [], toggleFavorite, loading }) => {
  const [isRemoving, setIsRemoving] = useState(null)

  const handleRemoveFavorite = async (photographerId) => {
    setIsRemoving(photographerId)
    try {
      await toggleFavorite(photographerId)
    } finally {
      setIsRemoving(null)
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
      <h2 className="text-3xl font-bold mb-8">My Favorite Photographers</h2>

      {favorites.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">❤️</div>
          <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
          <p className="text-gray-400 mb-6">Add photographers to your favorites list to quickly find them later.</p>
          <Link
            to="/search"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-block"
          >
            Find Photographers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((photographer) => (
            <motion.div
              key={photographer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-lg overflow-hidden"
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

                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleRemoveFavorite(photographer.id)}
                    disabled={isRemoving === photographer.id}
                    className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    {isRemoving === photographer.id ? (
                      <svg
                        className="animate-spin h-4 w-4 text-white"
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
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>

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
                        className={i < Math.floor(photographer.rating) ? "text-yellow-400" : "text-gray-600"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-400 text-sm">({photographer.reviewCount} reviews)</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {photographer.specialties.slice(0, 3).map((specialty, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">
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
                    <p className="text-white font-bold">${photographer.pricing.hourly}/hr</p>
                  </div>

                  <Link
                    to={`/book/${photographer.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-medium transition-transform hover:scale-105"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default ClientFavorites
