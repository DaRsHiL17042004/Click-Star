import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const ClientProfile = ({ profile, updateProfile, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    preferences: {
      shootTypes: [],
      budget: "",
      notifications: true,
    },
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Shoot types options
  const shootTypeOptions = [
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
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        preferences: profile.preferences || {
          shootTypes: [],
          budget: "",
          notifications: true,
        },
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

  const handleShootTypeChange = (shootType) => {
    const currentShootTypes = formData.preferences.shootTypes || []

    if (currentShootTypes.includes(shootType)) {
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          shootTypes: currentShootTypes.filter((type) => type !== shootType),
        },
      })
    } else {
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          shootTypes: [...currentShootTypes, shootType],
        },
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    const success = await updateProfile(formData)

    if (success) {
      setIsEditing(false)
    }

    setIsSaving(false)
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
        <h2 className="text-3xl font-bold">My Profile</h2>

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
                    <li className="flex items-center">
                      <span className="mr-2">📧</span>
                      <span>{formData.email}</span>
                    </li>
                    {formData.phone && (
                      <li className="flex items-center">
                        <span className="mr-2">📱</span>
                        <span>{formData.phone}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="md:w-2/3">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Photography Preferences</h4>

                  <div className="mb-4">
                    <p className="text-gray-400 mb-2">Interested in:</p>
                    {formData.preferences.shootTypes && formData.preferences.shootTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.preferences.shootTypes.map((type, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                            {type}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No preferences set</p>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-400 mb-2">Budget Range:</p>
                    <p className="text-white">
                      {formData.preferences.budget ? `$${formData.preferences.budget}` : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-2">Notification Preferences</h4>
                  <div className="flex items-center">
                    <span className={formData.preferences.notifications ? "text-green-500" : "text-red-500"}>
                      {formData.preferences.notifications ? "Enabled" : "Disabled"}
                    </span>
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
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your@email.com"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
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
                <label className="block text-sm font-medium mb-2">Photography Interests</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {shootTypeOptions.map((type, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleShootTypeChange(type)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.preferences.shootTypes && formData.preferences.shootTypes.includes(type)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300 border border-gray-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget Range ($)</label>
                <select
                  name="preferences.budget"
                  value={formData.preferences.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a budget range</option>
                  <option value="100-300">$100 - $300</option>
                  <option value="300-500">$300 - $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000+">$1,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notifications</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    name="preferences.notifications"
                    checked={formData.preferences.notifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          notifications: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="notifications">
                    Receive email notifications about new photographers, promotions, and updates
                  </label>
                </div>
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

export default ClientProfile
