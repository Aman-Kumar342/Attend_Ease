'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">
            Or{' '}
            <Link href="/login" className="auth-link">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}
          
          <div className="input-list">
            <input
              name="name"
              type="text"
              required
              className="input-field"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
            
            <input
              name="email"
              type="email"
              required
              className="input-field"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            
            <input
              name="phone"
              type="tel"
              required
              pattern="[0-9]{10}"
              className="input-field"
              placeholder="Phone Number (10 digits)"
              value={formData.phone}
              onChange={handleChange}
            />
            
            <input
              name="password"
              type="password"
              required
              minLength="6"
              className="input-field"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
            />
            
            <select
              name="role"
              className="input-field"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
