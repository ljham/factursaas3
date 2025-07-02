'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import AppLayout from '@/components/AppLayout';
import { useApiClient } from '@/lib/api-client';
import { Producto, ProductoCreate, ProductoUpdate } from '@/types/producto';

export default function Productos() {
  const { isLoaded, user } = useUser();
  const apiClient = useApiClient();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [soloActivos, setSoloActivos] = useState(true);

  // Form state
  const [formData, setFormData] = useState<ProductoCreate>({
    nombre: '',
    descripcion: '',
    precio: 0,
    tipo_iva: 21.00,
    es_servicio: false,
    codigo: '',
    activo: true
  });

  // Load productos on component mount
  useEffect(() => {
    if (isLoaded && user) {
      loadProductos();
    }
  }, [isLoaded, user, soloActivos]);

  const loadProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('solo_activos', soloActivos.toString());
      const data = await apiClient.get(`/api/productos?${params.toString()}`);
      setProductos(data);
    } catch (err) {
      setError('Error loading productos');
      console.error('Error loading productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      if (editingProducto) {
        // Update existing producto
        const updated = await apiClient.put(`/api/productos/${editingProducto.id}`, formData);
        setProductos(productos.map(p => p.id === editingProducto.id ? updated : p));
      } else {
        // Create new producto
        const newProducto = await apiClient.post('/api/productos', formData);
        setProductos([...productos, newProducto]);
      }
      
      resetForm();
      await loadProductos(); // Refresh the list
    } catch (err) {
      setError('Error saving producto');
      console.error('Error saving producto:', err);
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      tipo_iva: producto.tipo_iva,
      es_servicio: producto.es_servicio,
      codigo: producto.codigo || '',
      activo: producto.activo
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      setError(null);
      await apiClient.delete(`/api/productos/${id}`);
      setProductos(productos.filter(p => p.id !== id));
    } catch (err) {
      setError('Error deleting producto');
      console.error('Error deleting producto:', err);
    }
  };

  const toggleActivo = async (producto: Producto) => {
    try {
      setError(null);
      const updated = await apiClient.put(`/api/productos/${producto.id}`, {
        activo: !producto.activo
      });
      setProductos(productos.map(p => p.id === producto.id ? updated : p));
    } catch (err) {
      setError('Error updating producto status');
      console.error('Error updating producto status:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: 0,
      tipo_iva: 21.00,
      es_servicio: false,
      codigo: '',
      activo: true
    });
    setEditingProducto(null);
    setShowForm(false);
  };

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (producto.codigo && producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Productos
              </h1>
              <p className="mt-2 max-w-4xl text-sm text-gray-500">
                Gestiona tu catálogo de productos y servicios
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nuevo Producto
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="soloActivos"
              checked={soloActivos}
              onChange={(e) => setSoloActivos(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="soloActivos" className="text-sm text-gray-700">
              Solo activos
            </label>
          </div>
        </div>

        {/* Producto Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Código
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Precio *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.precio}
                        onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value) || 0})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        IVA (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.tipo_iva}
                        onChange={(e) => setFormData({...formData, tipo_iva: parseFloat(e.target.value) || 0})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="es_servicio"
                        checked={formData.es_servicio}
                        onChange={(e) => setFormData({...formData, es_servicio: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="es_servicio" className="ml-2 text-sm text-gray-700">
                        Es servicio
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                        Activo
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      {editingProducto ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Productos Table */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Cargando productos...</div>
              </div>
            ) : filteredProductos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IVA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProductos.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {producto.nombre}
                          </div>
                          {producto.descripcion && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {producto.descripcion}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.codigo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatPrice(producto.precio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.tipo_iva}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          producto.es_servicio 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {producto.es_servicio ? 'Servicio' : 'Producto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActivo(producto)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            producto.activo
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors cursor-pointer`}
                        >
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(producto.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}