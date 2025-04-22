import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="text-9xl font-bold text-purple-500 mb-6">404</div>
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-xl text-gray-400 mb-8">
              The page you are looking for doesn't exist or has been moved.
            </p>

            <Link
              to="/"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium inline-block transition-transform hover:scale-105"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
