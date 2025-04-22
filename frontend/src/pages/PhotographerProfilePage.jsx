// src/pages/PhotographerProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const PhotographerProfilePage = () => {
  const { id } = useParams(); // Photographer ID from route
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Photographer ID:', id);

        const profileRes = await axios.get(`http://localhost:5000/api/photographer/profile/${id}`);
        console.log(ratingRes.data);  // Log the response to check its structure
        const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/${id}`);
        const ratingRes = await axios.get(`http://localhost:5000/api/reviews/${id}/rating`);

        setProfile(profileRes.data);
        setReviews(reviewsRes.data);
        setRating(ratingRes.data?.averageRating?.toFixed(1) || 'N/A');
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [id]);

  if (!profile) return <div className="p-6">Loading photographer profile...</div>;

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <img
          src={profile.profileImage || '/default-profile.jpg'}
          alt={profile.name}
          className="w-40 h-40 object-cover rounded-full border shadow"
        />
        <div>
          <h2 className="text-3xl font-bold text-indigo-700">{profile.name}</h2>
          <p className="text-gray-600">📍 {profile.location}</p>
          <p className="mt-2 text-gray-800">{profile.about}</p>
          <p className="mt-4 font-semibold text-yellow-600">⭐ {rating} / 5</p>
          <button className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition">
            Book Now
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Portfolio</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {profile.portfolioImages?.map((img, idx) => (
            <motion.img
              key={idx}
              src={img.url}
              alt={`Portfolio ${idx + 1}`}
              className="w-full h-48 object-cover rounded shadow"
              whileHover={{ scale: 1.05 }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Client Reviews</h3>
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review, idx) => (
              <div key={idx} className="p-4 bg-gray-100 rounded shadow">
                <p className="text-gray-700 italic">"{review.comment}"</p>
                <p className="text-sm text-gray-600 mt-1">- {review.clientName}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>
    </motion.div>
  );
};

export default PhotographerProfilePage;
