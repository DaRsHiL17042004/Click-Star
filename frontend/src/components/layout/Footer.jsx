import React from 'react'
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo and Description */}
              <div className="col-span-1 md:col-span-2">
                <Link to="/" className="text-2xl font-bold">
                  <span className="text-purple-500">Photo</span>
                  <span>Connect</span>
                </Link>
                <p className="mt-4 text-gray-400 max-w-md">
                  Connecting clients with professional photographers for all your photography needs. Capture your special
                  moments with the perfect photographer.
                </p>
                <div className="mt-6 flex space-x-4">
                  {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                    <motion.a
                      key={social}
                      href={`#${social}`}
                      whileHover={{ y: -3 }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="sr-only">{social}</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.a>
                  ))}
                </div>
              </div>
    
              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  {[
                    { name: "Home", path: "/" },
                    { name: "Find Photographers", path: "/search" },
                    { name: "Login", path: "/login" },
                    { name: "Sign Up", path: "/register" },
                  ].map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
    
              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>123 Photography St.</li>
                  <li>New York, NY 10001</li>
                  <li>info@photoconnect.com</li>
                  <li>(123) 456-7890</li>
                </ul>
              </div>
            </div>
    
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
              <p>&copy; {new Date().getFullYear()} PhotoConnect. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )
}

export default Footer