"use client"

import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { useDispatch } from "react-redux"
import { useAuth } from "../../context/AuthContext"

// Redux actions
import { fetchLeads } from "../../redux/slices/adminLeadsSlice"
import { fetchUsers } from "../../redux/slices/adminUsersSlice"
import { fetchAdminStats } from "../../redux/slices/adminStatsSlice"

// Dashboard Components
import DashboardLayout from "../../components/dashboard/DashboardLayout"
import AdminLeads from "../../components/dashboard/admin/AdminLeads"
import AdminUsers from "../../components/dashboard/admin/AdminUsers"
import AdminStats from "../../components/dashboard/admin/AdminStats"

const AdminDashboard = () => {
  const { user } = useAuth()
  const dispatch = useDispatch()

  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(fetchLeads())
      dispatch(fetchUsers())
      dispatch(fetchAdminStats())
    }
  }, [dispatch, user])

  const navItems = [
    { path: "", label: "Dashboard", icon: "📊" },
    { path: "leads", label: "Leads", icon: "📋" },
    { path: "users", label: "Users", icon: "👥" },
  ]

  return (
    <DashboardLayout title="Admin Dashboard" navItems={navItems} userRole="admin">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<AdminStats />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="users" element={<AdminUsers />} />
        </Routes>
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default AdminDashboard
