import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../api/axios'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user }                  = useAuth()
  const [events, setEvents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [deleting, setDeleting]   = useState(null)

  useEffect(() => { fetchMyEvents() }, [])

  const fetchMyEvents = async () => {
    try {
      const res = await axiosInstance.get('/events/my-events/')
      setEvents(res.data)
    } catch {
      console.error('Error cargando eventos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    try {
      await axiosInstance.delete(`/events/${id}/`)
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch {
      alert('Error al eliminar el evento.')
    } finally {
      setDeleting(null)
    }
  }

  const statusColors = {
    draft:     'bg-yellow-50 text-yellow-600',
    published: 'bg-green-50 text-green-600',
    cancelled: 'bg-red-50 text-red-500',
    finished:  'bg-gray-100 text-gray-500',
  }

  const statusLabels = {
    draft: 'Borrador', published: 'Publicado',
    cancelled: 'Cancelado', finished: 'Finalizado'
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Gestiona tus eventos, {user?.first_name}</p>
        </div>
        <Link
          to="/events/create"
          className="bg-violet-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-violet-700 transition flex items-center gap-2 shadow-lg shadow-violet-200"
        >
          <span className="text-xl">+</span> Nuevo evento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total eventos', value: events.length, color: 'text-violet-600' },
          { label: 'Publicados', value: events.filter(e => e.status === 'published').length, color: 'text-green-600' },
          { label: 'Borradores', value: events.filter(e => e.status === 'draft').length, color: 'text-yellow-600' },
          { label: 'Cancelados', value: events.filter(e => e.status === 'cancelled').length, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de eventos */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-gray-500 text-lg mb-6">No tienes eventos creados aún</p>
          <Link
            to="/events/create"
            className="bg-violet-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-violet-700 transition"
          >
            Crear primer evento
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between hover:shadow-sm transition">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-800">{event.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[event.status]}`}>
                    {statusLabels[event.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>📅 {new Date(event.start_date).toLocaleDateString('es-CO')}</span>
                  <span>📍 {event.location}</span>
                  <span>👥 {event.available_spots} cupos disponibles</span>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <Link
                  to={`/events/${event.id}`}
                  className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-xl transition"
                >
                  Ver
                </Link>
                <Link
                  to={`/events/${event.id}/edit`}
                  className="text-sm text-violet-600 hover:text-violet-800 border border-violet-200 px-4 py-2 rounded-xl transition"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={deleting === event.id}
                  className="text-sm text-red-500 hover:text-red-700 border border-red-100 px-4 py-2 rounded-xl transition disabled:opacity-50"
                >
                  {deleting === event.id ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}