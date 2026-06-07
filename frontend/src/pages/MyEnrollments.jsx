import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../api/axios'

export default function MyEnrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const res = await axiosInstance.get('/enrollments/')
      setEnrollments(res.data)
    } catch {
      console.error('Error cargando inscripciones')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (enrollmentId) => {
    if (!confirm('¿Estás seguro de cancelar esta inscripción?')) return
    try {
      await axiosInstance.post(`/enrollments/${enrollmentId}/cancel/`)
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId))
    } catch {
      alert('Error al cancelar la inscripción.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <p className="text-gray-500">Cargando inscripciones...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Mis inscripciones
        </h1>
        <p className="text-gray-500">
          Eventos a los que estás inscrito
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-4">
            No tienes inscripciones activas.
          </p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Ver eventos disponibles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map(enrollment => (
            <div
              key={enrollment.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                {/* Categoría */}
                {enrollment.event_detail.category && (
                  <span className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full mb-2">
                    {enrollment.event_detail.category.name}
                  </span>
                )}

                {/* Título */}
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {enrollment.event_detail.title}
                </h2>

                {/* Fecha */}
                <p className="text-sm text-gray-500 mb-1">
                  📅 {new Date(enrollment.event_detail.start_date).toLocaleDateString('es-CO', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>

                {/* Ubicación */}
                <p className="text-sm text-gray-500">
                  📍 {enrollment.event_detail.location}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex flex-col items-end gap-2 ml-4">
                <Link
                  to={`/events/${enrollment.event_detail.id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Ver detalle
                </Link>
                <button
                  onClick={() => handleCancel(enrollment.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}