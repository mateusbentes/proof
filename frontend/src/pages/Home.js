import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Home.css';

function Home() {
  const { token } = useAuthStore();

  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to Proof</h1>
        <p>A human-centric community platform with conversational authentication</p>
        <p className="subtitle">
          No bots. No spam. No AI-generated noise. Just real conversations.
        </p>

        {!token && (
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        )}
      </section>

      <section className="features">
        <h2>Why Proof?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🤖 Bot Detection</h3>
            <p>Conversational authentication ensures only real humans join our communities.</p>
          </div>

          <div className="feature-card">
            <h3>🔒 Privacy First</h3>
            <p>Hosted in Europe. No tracking. No ads. Your data is yours.</p>
          </div>

          <div className="feature-card">
            <h3>🎨 Custom Avatars</h3>
            <p>Describe your avatar, and we'll generate it for you using AI.</p>
          </div>

          <div className="feature-card">
            <h3>👥 Niche Communities</h3>
            <p>Join communities for modding, free software, gaming, and more.</p>
          </div>

          <div className="feature-card">
            <h3>🌍 Decentralized</h3>
            <p>Built on open-source tools. Can be self-hosted or forked.</p>
          </div>

          <div className="feature-card">
            <h3>📊 Transparent</h3>
            <p>No algorithmic manipulation. Chronological feeds. Human connections.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Register</h3>
            <p>Create an account with your email and password.</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Chat</h3>
            <p>Answer questions about your interests and experience.</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Avatar</h3>
            <p>Describe your avatar, and we'll generate it for you.</p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>Join</h3>
            <p>Explore communities and connect with real people.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
