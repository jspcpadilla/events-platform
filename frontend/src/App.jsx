import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import MyEnrollments from './pages/MyEnrollments'
import Dashboard from './pages/Dashboard'
import EventForm from './pages/EventForm'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Públicas */}
            <Route path="/"           element={<Events />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/events/:id" element={<EventDetail />} />

            {/* Privadas participante */}
            <Route path="/my-enrollments" element={
              <PrivateRoute><MyEnrollments /></PrivateRoute>
            } />

            {/* Privadas organizador/admin */}
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/events/create" element={
              <PrivateRoute><EventForm /></PrivateRoute>
            } />
            <Route path="/events/:id/edit" element={
              <PrivateRoute><EventForm /></PrivateRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App