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
    <div className="auth-page">
      {/* Background Elements */}
      <div className="auth-bg-pattern"></div>
      
      {/* Header */}
      <div className="auth-header-section">
        <Link href="/" className="auth-logo-link">
          <div className="auth-logo">
            <span className="auth-logo-text">A</span>
          </div>
          <h1 className="auth-app-name">ATTENDEASE</h1>
        </Link>
      </div>

      {/* Main Content */}
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-icon">✨</div>
            <h2 className="auth-title">Join AttendEase</h2>
            <p className="auth-subtitle">
              Create your account and start managing your study time
            </p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📧</span>
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                className="form-input"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📱</span>
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                required
                pattern="[0-9]{10}"
                className="form-input"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                minLength="6"
                className="form-input"
                placeholder="Create a strong password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎭</span>
                Account Type
              </label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">🎓 Student Account</option>
                <option value="admin">👨‍💼 Admin Account</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <span className="btn-spinner">⏳</span>
                  Creating account...
                </>
              ) : (
                <>
                  <span className="btn-icon">🎉</span>
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-switch">
              Already have an account?{' '}
              <Link href="/login" className="auth-switch-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
