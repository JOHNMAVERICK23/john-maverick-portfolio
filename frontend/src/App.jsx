import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ComingSoon from './pages/admin/ComingSoon'

const pages = ['profile', 'about', 'projects', 'skills', 'experience',
  'certificates', 'education', 'messages', 'settings']

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8">Public site arrives in Phase 6.</div>} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {pages.map((p) => <Route key={p} path={p} element={<ComingSoon title={p} />} />)}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
