// src/pages/PhotographerListPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PhotographerListPage = () => {
    const [photographers, setPhotographers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPhotographers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://localhost:5000/api/photographer'); // Replace with your API endpoint
                setPhotographers(response.data);
            } catch (err) {
                setError('Failed to fetch photographers');
            } finally {
                setLoading(false);
            }
        };

        fetchPhotographers();
    }, []); 

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Available Photographers</h2>

            {/* Search + Filters UI */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search by location or shoot type..."
                    className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 transition">
                    Search
                </button>
            </div>

            {/* Photographer Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {photographers.map((photographer, index) => (
                    <motion.div
                        key={photographer._id}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <img
                            src={photographer.profileImage}
                            alt={photographer.name}
                            className="w-full h-56 object-cover rounded-t-lg"
                        />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800">{photographer.name}</h3>
                            <p className="text-sm text-gray-500">{photographer.location}</p>
                            <p className="text-sm text-gray-600 mt-1">⭐ {photographer.rating} / 5</p>
                            <div className="text-xs text-indigo-600 mt-2">
                                {photographer.shoots.join(', ')}
                            </div>
                            <Link
                                to={`/photographers/${photographer._id}`}
                                className="mt-4 inline-block text-indigo-600 hover:underline text-sm"
                            >
                                View Profile →
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default PhotographerListPage;
