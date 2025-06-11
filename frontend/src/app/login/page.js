'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
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

    const result = await login(formData);
    
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
            <div className="auth-icon">🔑</div>
            <h2 className="auth-title">Welcome Back!</h2>
            <p className="auth-subtitle">
              Sign in to access your library dashboard
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
                <span className="label-icon">🔒</span>
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <span className="btn-spinner">⏳</span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-switch">
              Don't have an account?{' '}
              <Link href="/register" className="auth-switch-link">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
