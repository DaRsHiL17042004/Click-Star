// src/pages/LandingPage.jsx
import { useRef, Suspense } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment, Stars } from "@react-three/drei"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

const ModelFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#222" />
  </mesh>
)

const LandingPage = () => {
  const scrollRef = useRef(null)

  const scrollToFeatures = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header transparent={true} />

      {/* Hero Section with 3D */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Suspense fallback={<ModelFallback />}>
  
              <Environment preset="sunset" />
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </Suspense>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Capture Your Perfect Moment
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Connect with professional photographers for your special occasions, portfolios, and events.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/search"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-medium inline-block"
                >
                  Find Photographers
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-transparent border-2 border-white rounded-full text-lg font-medium inline-block"
                >
                  Join as Photographer
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <button onClick={scrollToFeatures} className="text-white animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={scrollRef} className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our platform makes it easy to find, book, and collaborate with professional photographers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Find Your Photographer",
                description:
                  "Browse through our curated list of professional photographers and studios based on your location, budget, and style preferences.",
                icon: "🔍",
              },
              {
                title: "Book a Session",
                description:
                  "Schedule and book your photoshoot directly through our platform with our simple booking system.",
                icon: "📅",
              },
              {
                title: "Get Amazing Photos",
                description: "Receive professionally edited photos and share your experience by leaving a review.",
                icon: "📸",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-900 p-8 rounded-xl"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Capture Your Moments?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of clients and photographers on our platform and start creating beautiful memories.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-white text-purple-900 rounded-full text-lg font-medium inline-block"
                >
                  Sign Up Now
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-transparent border-2 border-white rounded-full text-lg font-medium inline-block"
                >
                  Login
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
};

export default LandingPage;
