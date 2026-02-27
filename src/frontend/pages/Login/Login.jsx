import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
import { useState } from 'react';
import './Login.css';
import logo from '../../assets/logo.webp';
import logoWhite from '../../assets/logo-white.png';
import googleLogo from '../../assets/google-brands-solid-full.svg';

export function Login() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ===== FORM STATE (Controlled Components) =====
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    gender: 'male', // From select dropdown
    bio: '',
  });

  const navigate = useNavigate(); // For /home redirect

  // ===== HANDLE INPUT CHANGE =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear errors
  };

  // ===== REGISTER SUBMIT (isVisible=true) =====
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // For cookies
        body: JSON.stringify({
          username: formData.username.trim(),
          age: parseInt(formData.age),
          gender: formData.gender, // From select
          bio: formData.bio.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/home');
        return;
      }

      // ERROR from backend
      setError(data.error || 'Registration failed');
    } catch (err) {
      setError('Network error. Try again.');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===== LOGIN SUBMIT (isVisible=false) =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: formData.username.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/home'); // Success → /home
        return;
      }
      setError(data.error || 'Login failed');
    } catch (err) {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="hero">
      <section className="hero__area">
        <h1 className="hero__area__title">J A M</h1>

        {!isVisible ? (
          // ===== LOGIN FORM =====
          <>
            <form className="login" onSubmit={handleLogin}>
              <img src={logoWhite} alt="Jam logo" />
              <legend>Welcome back</legend>
              <button className="button" type="button" disabled={loading}>
                {' '}
                {/* Google TBD */}
                <img src={googleLogo} alt="Google logo" />
                <span>Sign in with Google</span>
              </button>
              <span>or</span>
              <input
                className="input"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <input
                className="button"
                type="submit"
                value={loading ? 'Signing in...' : 'Continue'}
                disabled={loading}
              />
              <small>
                Don't have an account?{' '}
                <Link onClick={() => setIsVisible(true)}>Sign up</Link>
              </small>
              {error && <div className="error">{error}</div>}
            </form>
          </>
        ) : (
          // ===== REGISTER FORM =====
          <form className="register" onSubmit={handleRegister}>
            <img src={logoWhite} alt="Jam logo" />
            <legend>Welcome to Jam!</legend>
            <button className="button" type="button" disabled={loading}>
              <img src={googleLogo} alt="Google logo" />
              <span>Sign in with Google</span>
            </button>
            <span>or</span>

            {/* FILE INPUT (handle later) */}
            <input
              type="file"
              name="profile image"
              id="profile image"
              disabled
            />

            {/* USERNAME */}
            <input
              className="input"
              type="text"
              name="username"
              id="username"
              placeholder="Your Name"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              required
              minLength={3}
            />

            {/* AGE + GENDER */}
            <div className="age-gender">
              <input
                className="input"
                type="number"
                name="age"
                min={18}
                max={105}
                placeholder="age"
                value={formData.age}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <select
                className="input"
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={loading}
                required
              >
                <option value="male">male</option>
                <option value="female">female</option>
              </select>
            </div>

            {/* BIO */}
            <textarea
              className="input"
              name="bio"
              id="bio"
              placeholder="Enter your bio here..."
              value={formData.bio}
              onChange={handleInputChange}
              disabled={loading}
              rows={5}
            ></textarea>

            <input
              className="button"
              type="submit"
              value={loading ? 'Creating...' : 'Submit'}
              disabled={loading}
            />

            <small>
              Already have an account?{' '}
              <Link onClick={() => setIsVisible(false)}>Sign in</Link>
            </small>
            <small>
              By signing in, you agree to our <a href="#">Terms</a> and{' '}
              <a href="#">Privacy Policy</a>
            </small>
            {error && <div className="error">{error}</div>}
          </form>
        )}
      </section>

      <section className="hero__logo">
        <img src={logo} alt="logo of the app" />
      </section>
    </main>
  );
}

export default Login;
