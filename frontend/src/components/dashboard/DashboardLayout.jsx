import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = ({ children, title, navItems, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };      

  const getBasePath = () => {
    switch (userRole) {
      case "photographer":
        return "/photographer-dashboard";
      case "client":
        return "/client-dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/";
    }
  };

  const basePath = getBasePath();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <motion.div
        className="bg-gray-800 h-screen"
        initial={{ width: isSidebarOpen ? 250 : 80 }}
        animate={{ width: isSidebarOpen ? 250 : 80 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: isSidebarOpen ? 1 : 0 }}
            animate={{ opacity: isSidebarOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className={`font-bold text-xl ${!isSidebarOpen && "hidden"}`}
          >
            <span className="text-purple-500">Photo</span>
            <span>Connect</span>
          </motion.div>

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
        </div>

        <div className="mt-8">
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === `${basePath}/${item.path}` ||
                  (location.pathname === basePath && item.path === "");

                return (
                  <li key={item.path}>
                    <Link
                      to={`${basePath}/${item.path}`}
                      className={`flex items-center px-4 py-3 ${
                        isActive ? "bg-purple-700" : "hover:bg-gray-700"
                      } transition-colors`}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      {isSidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl mr-3">🚪</span>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-gray-800 p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{title}</h1>

            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-400 capitalize">{userRole}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
