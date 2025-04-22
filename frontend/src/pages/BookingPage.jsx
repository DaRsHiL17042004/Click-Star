// src/pages/BookingPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const BookingPage = () => {
  const { photographerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [photographer, setPhotographer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: 1,
    location: "",
    type: "portrait",
    details: "",
    package: "hourly",
  });

  const [errors, setErrors] = useState({});

  const shootTypes = [
    { value: "portrait", label: "Portrait Session" },
    { value: "wedding", label: "Wedding Photography" },
    { value: "event", label: "Event Coverage" },
    { value: "family", label: "Family Session" },
    { value: "commercial", label: "Commercial Shoot" },
  ];

  const packageTypes = [
    { value: "hourly", label: "Hourly Rate" },
    { value: "event", label: "Event Package" },
    { value: "package", label: "Custom Package" },
  ];

  useEffect(() => {
    const fetchPhotographer = async () => {
      try {
        const response = await axios.get(`/api/photographer/${photographerId}`);
        setPhotographer(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching photographer:", error);
        toast.error("Failed to load photographer details");
        setLoading(false);
      }
    };

    fetchPhotographer();
  }, [photographerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.type) newErrors.type = "Shoot type is required";
    if (!formData.package) newErrors.package = "Package type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePrice = () => {
    if (!photographer) return 0;

    let basePrice = 0;
    switch (formData.package) {
      case "hourly":
        basePrice = photographer.pricing.hourly * formData.duration;
        break;
      case "event":
        basePrice = photographer.pricing.event;
        break;
      case "package":
        basePrice = photographer.pricing.package;
        break;
      default:
        basePrice = photographer.pricing.hourly * formData.duration;
    }
    return basePrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      const bookingData = {
        photographerId,
        clientId: user.id,
        date: formData.date,
        time: formData.time,
        duration: Number.parseInt(formData.duration),
        location: formData.location,
        type: formData.type,
        details: formData.details,
        package: formData.package,
        price: calculatePrice(),
        status: "pending",
      };

      await axios.post("/api/bookings", bookingData);

      toast.success("Booking request submitted successfully!");
      navigate("/client-dashboard/bookings");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to submit booking request");
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Photographer Info */}
              <div className="md:w-1/3">
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden sticky top-24">
                  <div className="h-48 bg-gray-700 relative">
                    {photographer?.portfolio?.length > 0 ? (
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
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{photographer.name}</h2>
                    <p className="text-gray-400 mb-4">{photographer.location}</p>
                    <div className="flex items-center mb-4">
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
                      <span className="ml-2 text-gray-400 text-sm">
                        ({photographer.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Pricing</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Hourly Rate:</span>
                          <span className="font-bold">${photographer.pricing.hourly}/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Event Package:</span>
                          <span className="font-bold">${photographer.pricing.event}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custom Package:</span>
                          <span className="font-bold">${photographer.pricing.package}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {photographer.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="md:w-2/3">
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Book a Session with {photographer.name}</h2>

                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Form Inputs */}
                        {/* You already have these implemented in your original code */}
                        {/* Just continue placing the input fields here, same as you shared */}
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Details (optional)</label>
                        <textarea
                          name="details"
                          value={formData.details}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Anything specific you want to mention?"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        ></textarea>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          {submitting ? "Submitting..." : `Book Now ($${calculatePrice()})`}
                        </button>
                      </div>
                    </form>

                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
