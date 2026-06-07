import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../api/axios'

export default function EventForm() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const isEditing     = !!id

  const [categories, setCategories]             = useState([])
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState('')
  const [showNewCategory, setShowNewCategory]   = useState(false)
  const [newCategoryName, setNewCategoryName]   = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categorySuccess, setCategorySuccess]   = useState('')

  const [form, setForm] = useState({
    title: '', description: '', category_id: '',
    start_date: '', end_date: '', location: '',
    capacity: '', price: '0', status: 'draft'
  })

  useEffect(() => {
    fetchCategories()
    if (isEditing) fetchEvent()
  }, [id])

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/events/categories/')
      setCategories(res.data)
    } catch {}
  }

  const fetchEvent = async () => {
    try {
      const res = await axiosInstance.get(`/events/${id}/`)
      const e   = res.data
      setForm({
        title:       e.title,
        description: e.description,
        category_id: e.category?.id || '',
        start_date:  e.start_date?.slice(0, 16),
        end_date:    e.end_date?.slice(0, 16),
        location:    e.location,
        capacity:    e.capacity,
        price:       e.price,
        status:      e.status,
      })
    } catch {}
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    try {
      const res = await axiosInstance.post('/events/categories/', {
        name: newCategoryName.trim()
      })
      setCategories(prev => [...prev, res.data])
      setForm(prev => ({ ...prev, category_id: res.data.id }))
      setCategorySuccess(`Categoría "${res.data.name}" creada y seleccionada.`)
      setNewCategoryName('')
      setShowNewCategory(false)
      setTimeout(() => setCategorySuccess(''), 3000)
    } catch {
      alert('Error al crear la categoría.')
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEditing) {
        await axiosInstance.put(`/events/${id}/`, form)
      } else {
        await axiosInstance.post('/events/', form)
      }
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      const msg  = data ? Object.values(data).flat().join(' ') : 'Error al guardar.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditing ? 'Editar evento' : 'Crear nuevo evento'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditing ? 'Modifica los datos del evento' : 'Completa la información para publicar tu evento'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Información básica */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 text-lg">Información básica</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del evento *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Ej: Hackathon Barranquilla 2026"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe de qué trata tu evento..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 resize-none"
            />
          </div>

          {/* Categoría con opción de crear nueva */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>

            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la nueva categoría..."
                  className="flex-1 border border-violet-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory || !newCategoryName.trim()}
                  className="bg-violet-600 text-white px-4 py-3 rounded-xl hover:bg-violet-700 transition disabled:opacity-50 font-medium"
                >
                  {creatingCategory ? '...' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewCategory(false); setNewCategoryName('') }}
                  className="border border-gray-200 text-gray-500 px-4 py-3 rounded-xl hover:bg-gray-50 transition"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 bg-white"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="border border-violet-200 text-violet-600 px-4 py-3 rounded-xl hover:bg-violet-50 transition text-sm font-medium whitespace-nowrap"
                >
                  + Nueva
                </button>
              </div>
            )}

            {categorySuccess && (
              <p className="text-green-600 text-xs mt-2">✓ {categorySuccess}</p>
            )}
          </div>
        </div>

        {/* Fechas y lugar */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 text-lg">Fecha y lugar</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de inicio *
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de fin *
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación *
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Ej: Centro de Convenciones, Barranquilla"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
            />
          </div>
        </div>

        {/* Capacidad y precio */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 text-lg">Capacidad y precio</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad *
              </label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                required
                min="1"
                placeholder="100"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (COP)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0 = Gratis"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 bg-white"
            >
              <option value="draft">Borrador — no visible al público</option>
              <option value="published">Publicado — visible al público</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-2xl font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-violet-600 text-white py-4 rounded-2xl font-semibold hover:bg-violet-700 transition disabled:opacity-50 shadow-lg shadow-violet-200"
          >
            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </div>

      </form>
    </div>
  )
}