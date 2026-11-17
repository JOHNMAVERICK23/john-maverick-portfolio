import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Messages from './pages/admin/Messages'
import Projects from './pages/admin/Projects'
import Skills from './pages/admin/Skills'
import Experience from './pages/admin/Experience'
import Certificates from './pages/admin/Certificates'
import Education from './pages/admin/Education'
import Profile from './pages/admin/Profile'
import About from './pages/admin/About'
import Settings from './pages/admin/Settings'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8">Public site arrives in Phase 6.</div>} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="messages" element={<Messages />} />
          <Route path="projects" element={<Projects />} />
<Route path="skills" element={<Skills />} />
<Route path="experience" element={<Experience />} />
<Route path="certificates" element={<Certificates />} />
<Route path="education" element={<Education />} />
<Route path="profile" element={<Profile />} />
<Route path="about" element={<About />} />
<Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
