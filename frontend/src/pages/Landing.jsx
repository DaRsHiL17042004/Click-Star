import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="relative h-[80vh] w-full">
        <Canvas>
          <Suspense fallback={null}>
            {/* Add 3D elements or floating animations here */}
          </Suspense>
        </Canvas>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl font-bold"
          >
            Find the Perfect Photographer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-lg"
          >
            Book trusted professionals for your next shoot
          </motion.p>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 }}
            className="mt-6"
          >
            <a href="/search" className="bg-blue-600 px-6 py-3 rounded-full text-white text-lg hover:bg-blue-700 transition-all">
              Explore Photographers
            </a>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
