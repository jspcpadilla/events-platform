import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../api/axios'

export default function Events() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async (query = '') => {
    try {
      const url = query ? `/events/?search=${query}` : '/events/'
      const res = await axiosInstance.get(url)
      setEvents(res.data)
    } catch {
      console.error('Error cargando eventos')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    fetchEvents(e.target.value)
  }

  return (
    <div>

      {/* Hero */}
      <div className="relative text-white overflow-hidden">
        
        {/* Imagen de fondo */}
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop"
          alt="Eventos"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/55"></div>

        {/* Contenido */}
        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Descubre eventos<br/>
            <span className="text-violet-300">extraordinarios</span>
          </h1>

          <p className="text-gray-200 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Encuentra los mejores eventos, cursos y experiencias cerca de ti
          </p>

          {/* Buscador hero */}
          <div className="max-w-lg mx-auto relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Buscar eventos, cursos..."
              className="w-full bg-white text-gray-800 pl-12 pr-4 py-4 rounded-2xl shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-300 text-base"
            />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Eventos activos', value: events.length },
            { label: 'Categorías', value: '8+' },
            { label: 'Participantes', value: '500+' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <p className="text-3xl font-bold text-violet-600">
                {stat.value}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Título sección */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {search ? `Resultados para "${search}"` : 'Todos los eventos'}
          </h2>

          <span className="text-gray-400 text-sm">
            {events.length} eventos
          </span>
        </div>

        {/* Grid eventos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="bg-gray-100 rounded-3xl h-64 animate-pulse"
              ></div>
            ))}
          </div>

        ) : events.length === 0 ? (

          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>

            <p className="text-gray-400 text-lg">
              No encontramos eventos.
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {events.map(event => (

              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group"
              >
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                  {/* Header */}
                  <div className="h-40 bg-gradient-to-br from-violet-500 to-indigo-600 relative p-6 flex flex-col justify-between">

                    {event.category && (
                      <span className="self-start bg-white/20 backdrop-blur text-white text-xs font-medium px-3 py-1 rounded-full">
                        {event.category.name}
                      </span>
                    )}

                    <h3 className="text-white font-bold text-xl leading-tight">
                      {event.title}
                    </h3>
                  </div>

                  {/* Info */}
                  <div className="p-5">

                    <p className="text-sm text-gray-500 mb-3">
                      Por{' '}
                      <span className="font-medium text-gray-700">
                        {event.organizer_name}
                      </span>
                    </p>

                    <div className="space-y-2 mb-4">

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>📅</span>

                        <span>
                          {new Date(event.start_date).toLocaleDateString(
                            'es-CO',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            }
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>📍</span>

                        <span className="truncate">
                          {event.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">

                      <span className="text-lg font-bold text-violet-600">
                        {event.is_free ? 'Gratis' : `$${event.price}`}
                      </span>

                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          event.available_spots > 10
                            ? 'bg-green-50 text-green-600'
                            : event.available_spots > 0
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {event.available_spots > 0
                          ? `${event.available_spots} cupos`
                          : 'Agotado'}
                      </span>

                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}