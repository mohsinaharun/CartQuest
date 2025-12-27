import React, { useState } from 'react';
import axios from 'axios';

const AddressSelector = ({ addresses, selectedAddress, onSelectAddress, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
    isDefault: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const resetForm = () => {
    setFormData({
      fullName: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Bangladesh',
      isDefault: false
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (address) => {
    setFormData({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        await axios.put(`${API_URL}/api/addresses/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/addresses`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error saving address:', error);
      setError(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/addresses/${id}/set-default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Delivery Address</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-3 mb-4">
        {addresses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No addresses saved. Please add a new address.</p>
        ) : (
          addresses.map(addr => (
            <div
              key={addr._id}
              className={`p-4 border-2 rounded-lg transition cursor-pointer ${
                selectedAddress === addr._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1" onClick={() => onSelectAddress(addr._id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{addr.fullName}</p>
                    {addr.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{addr.phoneNumber}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {addr.addressLine1}
                    {addr.addressLine2 && `, ${addr.addressLine2}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">{addr.country}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={selectedAddress === addr._id}
                    onChange={() => onSelectAddress(addr._id)}
                    className="w-4 h-4 text-blue-600"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(addr)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition font-medium"
        >
          + Add New Address
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="border-2 border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-gray-800 mb-3">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={formData.phoneNumber}
              onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <input
            type="text"
            placeholder="Address Line 1 *"
            value={formData.addressLine1}
            onChange={e => setFormData({...formData, addressLine1: e.target.value})}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="text"
            placeholder="Address Line 2 (Optional)"
            value={formData.addressLine2}
            onChange={e => setFormData({...formData, addressLine2: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="City *"
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="State *"
              value={formData.state}
              onChange={e => setFormData({...formData, state: e.target.value})}
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Zip Code *"
              value={formData.zipCode}
              onChange={e => setFormData({...formData, zipCode: e.target.value})}
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <input
            type="text"
            placeholder="Country"
            value={formData.country}
            onChange={e => setFormData({...formData, country: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={e => setFormData({...formData, isDefault: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>
          
          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-300 font-medium"
            >
              {loading ? 'Saving...' : (editingId ? 'Update Address' : 'Save Address')}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddressSelector;