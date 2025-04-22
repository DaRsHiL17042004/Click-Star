"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { updatePhotographerProfile } from "../../../redux/slices/photographerSlice"
import { useAuth } from "../../../context/AuthContext"

const PhotographerProfile = ({ loading }) => {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { profile } = useSelector((state) => state.photographer)

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    specialties: [],
    pricing: {
      hourly: 0,
      event: 0,
      package: 0,
    },
    phone: "",
    website: "",
    instagram: "",
    availability: [],
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState("")

  // Specialties options
  const specialtyOptions = [
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
  ]

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        specialties: profile.specialties || [],
        pricing: profile.pricing || {
          hourly: 0,
          event: 0,
          package: 0,
        },
        phone: profile.phone || "",
        website: profile.website || "",
        instagram: profile.instagram || "",
        availability: profile.availability || [],
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSpecialtyChange = (specialty) => {
    if (formData.specialties.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter((s) => s !== specialty),
      })
    } else {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty],
      })
    }
  }

  const addCustomSpecialty = () => {
    if (newSpecialty && !formData.specialties.includes(newSpecialty)) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty],
      })
      setNewSpecialty("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await dispatch(
        updatePhotographerProfile({
          photographerId: user.id,
          profileData: formData,
        }),
      ).unwrap()
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsSaving(false)
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
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Photographer Profile</h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="w-40 h-40 rounded-full bg-purple-600 flex items-center justify-center text-4xl font-bold mx-auto">
                  {formData.name.charAt(0).toUpperCase()}
                </div>

                <div className="mt-6 text-center">
                  <h3 className="text-2xl font-bold">{formData.name}</h3>
                  <p className="text-gray-400 mt-1">{formData.location}</p>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2">Contact Information</h4>
                  <ul className="space-y-2 text-gray-300">
                    {formData.phone && (
                      <li className="flex items-center">
                        <span className="mr-2">📱</span>
                        <span>{formData.phone}</span>
                      </li>
                    )}
                    {formData.website && (
                      <li className="flex items-center">
                        <span className="mr-2">🌐</span>
                        <a
                          href={formData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline"
                        >
                          {formData.website.replace(/^https?:\/\//, "")}
                        </a>
                      </li>
                    )}
                    {formData.instagram && (
                      <li className="flex items-center">
                        <span className="mr-2">📸</span>
                        <a
                          href={`https://instagram.com/${formData.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline"
                        >
                          {formData.instagram}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="md:w-2/3">
                <div>
                  <h4 className="text-lg font-semibold mb-2">About Me</h4>
                  <p className="text-gray-300 whitespace-pre-line">{formData.bio || "No bio provided yet."}</p>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-2">Specialties</h4>
                  {formData.specialties && formData.specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.specialties.map((specialty, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No specialties added yet.</p>
                  )}
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-2">Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Hourly Rate</p>
                      <p className="text-2xl font-bold">${formData.pricing?.hourly || 0}/hr</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Event Rate</p>
                      <p className="text-2xl font-bold">${formData.pricing?.event || 0}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Package Rate</p>
                      <p className="text-2xl font-bold">${formData.pricing?.package || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="City, State"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tell clients about yourself and your photography style..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="(123) 456-7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="@yourusername"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Specialties</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {specialtyOptions.map((specialty, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSpecialtyChange(specialty)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.specialties.includes(specialty)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300 border border-gray-600"
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>

                <div className="flex">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Add custom specialty"
                  />
                  <button
                    type="button"
                    onClick={addCustomSpecialty}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-r-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hourly Rate ($)</label>
                <input
                  type="number"
                  name="pricing.hourly"
                  value={formData.pricing.hourly}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Rate ($)</label>
                <input
                  type="number"
                  name="pricing.event"
                  value={formData.pricing.event}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Package Rate ($)</label>
                <input
                  type="number"
                  name="pricing.package"
                  value={formData.pricing.package}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium transition-transform transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
              >
                {isSaving ? (
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
                    Saving...
                  </span>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </motion.div>
  )
}

export default PhotographerProfile
