import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import '../styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const data = await authAPI.register(formData.username, formData.email, formData.password);
      if (data.success) { login(data.token, data.user); navigate('/dashboard'); }
    } catch (err) { setError(err.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header"><div className="auth-icon">✨</div><h1>Create Account</h1><p>Join Meme Vault</p></div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}
          <div className="form-group"><label>Username</label><input type="text" name="username" placeholder="meme_master" value={formData.username} onChange={handleChange} required className="form-input" /></div>
          <div className="form-group"><label>Email</label><input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="form-input" /></div>
          <div className="form-group"><label>Password</label><input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="form-input" /></div>
          <div className="form-group"><label>Confirm Password</label><input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className="form-input" /></div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <div className="auth-footer"><p>Already have an account? <Link to="/login" className="link">Sign in</Link></p></div>
      </div>
    </div>
  );
}
