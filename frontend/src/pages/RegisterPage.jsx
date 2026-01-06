import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminSecret: ''
  });
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group mb-4">
          <label className="block mb-2 font-medium text-gray-700">Account Type</label>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition ${!showAdminInput ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="accountType"
                checked={!showAdminInput}
                onChange={() => {
                  setShowAdminInput(false);
                  setFormData(prev => ({ ...prev, adminSecret: '' }));
                }}
                className="hidden"
              />
              <span className="font-semibold">Consumer</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition ${showAdminInput ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="accountType"
                checked={showAdminInput}
                onChange={() => setShowAdminInput(true)}
                className="hidden"
              />
              <span className="font-semibold">Admin</span>
            </label>
          </div>
        </div>

        {showAdminInput && (
          <div className="form-group mb-4 animate-fade-in">
            <label className="block text-gray-700 font-bold mb-2">Admin Secret Code</label>
            <input
              type="password"
              name="adminSecret"
              value={formData.adminSecret}
              onChange={handleChange}
              placeholder="Enter secure admin code"
              className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
        )}
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default RegisterPage;
