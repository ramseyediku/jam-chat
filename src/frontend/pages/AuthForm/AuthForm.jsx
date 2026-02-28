import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Authform.css';
import logo from '../../assets/logo.webp';
import googleLogo from '../../assets/google-brands-solid-full.svg';
import defaultpfp from '../../assets/default-pfp.png';

export function Login() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    gender: 'male', // From select dropdown default male
    bio: '',
  });
  const [pfpPreview, setPfpPreview] = useState(defaultpfp); // Default pic
  const [pfpFile, setPfpFile] = useState(null);

  useEffect(() => {
    if (pfpPreview && pfpPreview.startsWith('blob:')) {
      return () => URL.revokeObjectURL(pfpPreview); // Cleanup blob URLs
    }
  }, [pfpPreview]);

  const navigate = useNavigate(); // For /home redirect
  const fileInputRef = useRef(null);

  // form inputs change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear errors
  };

  // handle PFP file selection
  const handlePfpChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPfpPreview(url);
      setPfpFile(file);
      setError(''); // Clear errors
    }
  };

  // handles registration logic
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username.trim());
      formDataToSend.append('age', parseInt(formData.age));
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('bio', formData.bio.trim());
      if (pfpFile) {
        formDataToSend.append('pfp', pfpFile);
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        // SUCCESS → Navigate to /home
        navigate('/home');
        console.log('Registration successful:', data);
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

  // handles login logic
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
    <main className="authform">
      <h1 id="apptitle">JAM</h1>
      <section className="authform__area">
        {!isVisible ? (
          // ===== LOGIN FORM =====
          <>
            <form className="login" onSubmit={handleLogin}>
              <legend>Welcome back!</legend>
              <button className="button" type="button" disabled={loading}>
                <img src={googleLogo} alt="Google logo" />
                <span>Continue with Google</span>
              </button>
              <span>or</span>
              <section className="group">
                <label htmlFor="username">Name</label>
                <input
                  className="input"
                  type="text"
                  name="username"
                  id="username-login"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </section>
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
            <legend>Welcome to Jam Chat!</legend>

            <section className="group">
              <label className="label">Profile image</label> {/* New class */}
              <div id="profile-picker" className="relative">
                {' '}
                {/* ID here */}
                <label htmlFor="pfp-upload" className="picker-label">
                  {' '}
                  {/* New class */}
                  <img
                    src={pfpPreview}
                    alt="Profile preview"
                    className="profile-img"
                  />
                  <div className="change-text">Click to change</div>
                </label>
                <input
                  ref={fileInputRef}
                  id="pfp-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePfpChange}
                  disabled={loading}
                  className="file-input"
                />
              </div>
            </section>

            {/* username field */}
            <section className="group">
              <label htmlFor="username">Enter your name</label>
              <input
                className="input"
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                required
                minLength={3}
              />
            </section>

            {/* AGE + GENDER */}
            <div className="age-gender">
              <section className="group">
                <label htmlFor="age">Select age</label>
                <input
                  className="input"
                  type="number"
                  name="age"
                  id="age"
                  min={18}
                  max={105}
                  value={formData.age}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </section>

              <section className="group">
                <label htmlFor="gender">Select gender</label>
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
              </section>
            </div>

            {/* BIO */}
            <section className="group">
              <label htmlFor="bio">Enter your bio</label>
              <textarea
                className="input"
                name="bio"
                id="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={loading}
                rows={5}
              ></textarea>
            </section>

            <input
              className="button"
              type="submit"
              value={loading ? 'Creating...' : 'Submit'}
              disabled={loading}
            />

            <small>
              Already have an account?{' '}
              <Link
                onClick={() => {
                  setIsVisible(false);
                  setPfpPreview(defaultPfp);
                  setPfpFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Sign in
              </Link>
            </small>
            <small>
              By signing in, you agree to our <a href="#">Terms</a> and{' '}
              <a href="#">Privacy Policy</a>
            </small>
            {error && <div className="error">{error}</div>}
          </form>
        )}
      </section>
      <img className="authform__logo" src={logo} alt="logo of the app" />
    </main>
  );
}

export default Login;
