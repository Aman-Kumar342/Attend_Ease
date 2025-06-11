'use client';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return <div className="loading-screen">Redirecting to dashboard...</div>;
  }

  return (
    <div className="landing-page">
      {/* Header with Logo */}
      <header className="landing-header">
        <div className="logo-section">
          <div className="logo-icon">
            <span className="logo-text">A</span>
          </div>
          <h1 className="app-name">ATTENDEASE</h1>
        </div>
        <p className="tagline">Smart Library Management System</p>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="hero-section">
          <h2 className="hero-title">
            Welcome to the Future of 
            <span className="highlight"> Library Management</span>
          </h2>
          <p className="hero-description">
            Book seats, track attendance, and manage your study time with our intelligent system
          </p>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <Link href="/login" className="btn-signin">
            <div className="btn-content">
              <span className="btn-icon">🔑</span>
              <div className="btn-text">
                <span className="btn-title">Sign In</span>
                <span className="btn-subtitle">Access your account</span>
              </div>
            </div>
          </Link>
          
          <Link href="/register" className="btn-register">
            <div className="btn-content">
              <span className="btn-icon">✨</span>
              <div className="btn-text">
                <span className="btn-title">Create Account</span>
                <span className="btn-subtitle">Join AttendEase today</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="features-section">
          <div className="feature-card">
            <span className="feature-icon">📚</span>
            <h3>Smart Booking</h3>
            <p>Reserve your perfect study spot</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📱</span>
            <h3>QR Check-in</h3>
            <p>Contactless attendance tracking</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Analytics</h3>
            <p>Track your study patterns</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>🚀 Built for modern libraries • 🎯 Designed for students</p>
      </footer>
    </div>
  );
}
