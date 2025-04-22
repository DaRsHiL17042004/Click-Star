import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../context/AuthContext"

function Header({ transparent = false }) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { isAuthenticated, user, logout } = useAuth()
    const location = useLocation()
  
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10)
      }
  
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }, [])
  
    // Close mobile menu when route changes
    useEffect(() => {
      setIsMobileMenuOpen(false)
    }, [location])
  
    const getDashboardLink = () => {
      if (!user) return "/"
  
      switch (user.role) {
        case "photographer":
          return "/photographer-dashboard"
        case "client":
          return "/client-dashboard"
        case "admin":
          return "/admin-dashboard"
        default:
          return "/"
      }
    }
  
    const headerClass =
      transparent && !isScrolled
        ? "absolute top-0 left-0 right-0 z-50 text-white"
        : `fixed top-0 left-0 right-0 z-50 bg-gray-900 shadow-lg ${isScrolled ? "py-2" : "py-4"} transition-all duration-300`
  
    return (
      <header className={headerClass}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center"
              >
                <span className="text-purple-500">Photo</span>
                <span>Connect</span>
              </motion.div>
            </Link>
  
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-purple-400 transition-colors">
                Home
              </Link>
              <Link to="/search" className="hover:text-purple-400 transition-colors">
                Find Photographers
              </Link>
  
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} className="hover:text-purple-400 transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-purple-400 transition-colors">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
  
            {/* Mobile Menu Button */}
            <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
  
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-gray-800"
            >
              <div className="container mx-auto px-4 py-4">
                <nav className="flex flex-col space-y-4">
                  <Link to="/" className="py-2 hover:text-purple-400 transition-colors">
                    Home
                  </Link>
                  <Link to="/search" className="py-2 hover:text-purple-400 transition-colors">
                    Find Photographers
                  </Link>
  
                  {isAuthenticated ? (
                    <>
                      <Link to={getDashboardLink()} className="py-2 hover:text-purple-400 transition-colors">
                        Dashboard
                      </Link>
                      <button onClick={logout} className="py-2 text-left hover:text-purple-400 transition-colors">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="py-2 hover:text-purple-400 transition-colors">
                        Login
                      </Link>
                      <Link to="/register" className="py-2 hover:text-purple-400 transition-colors">
                        Sign Up
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    )
}

export default Header