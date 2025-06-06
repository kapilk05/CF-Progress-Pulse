import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    age: '',
    password: '',
    confirmPassword: '',
    leetcode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      return setMsg('Password must be at least 6 characters');
    }
    if (formData.password !== formData.confirmPassword) {
      return setMsg('Passwords do not match');
    }

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          branch: formData.branch,
          age: formData.age,
          leetcode_profile: formData.leetcode,
        }),
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        setUser({ name: formData.name, email: formData.email }); // Can later fetch real user info
        navigate('/');
      } else {
        setMsg(data.msg || 'Registration failed!');
      }
    } catch (err) {
      setMsg('Error registering. Try again.');
    }
  };

  return (
    <PageWrapper>
      <StyledWrapper>
        <form className="form" onSubmit={handleSubmit}>
          <p className="title">Register</p>
          <p className="message">Signup now and get full access to our app.</p>

          <label>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="input"
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <input
              required
              type="email"
              name="email"
              placeholder="Email *"
              className="input"
              onChange={handleChange}
            />
          </label>

          <label>
            <select
              name="branch"
              className="input"
              value={formData.branch}
              onChange={handleChange}
              required
            >
              <option value="">Select Branch</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="ME">Mechanical (ME)</option>
              <option value="CE">Civil (CE)</option>
              <option value="EEE">Electrical (EEE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            <input
              type="number"
              name="age"
              placeholder="Age"
              className="input"
              onChange={handleChange}
            />
          </label>

          <label className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password *"
              className="input"
              required
              minLength={6}
              onChange={handleChange}
            />
            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setShowPassword(!showPassword);
                }
              }}
            >
              {showPassword ? '(o)' : '(:)'}
            </span>
          </label>

          <label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="input"
              onChange={handleChange}
            />
          </label>

          <label>
            <input
              type="text"
              name="leetcode"
              placeholder="Leetcode Profile"
              className="input"
              onChange={handleChange}
            />
          </label>

          {msg && <p className="message">{msg}</p>}

          <button type="submit" className="submit">
            Register
          </button>
          <p className="signin">
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </form>
      </StyledWrapper>
    </PageWrapper>
  );
};

export default Register;

const PageWrapper = styled.div`
  background-color: #000;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 400px;
    padding: 30px;
    background: linear-gradient(145deg, #1e1e1e, #2a2a2a);
    border-radius: 20px;
    box-shadow: 0 0 20px rgba(0, 123, 255, 0.4);
    font-family: 'Segoe UI', sans-serif;
    color: white;
  }

  .title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 5px;
    color: white;
  }

  .message {
    font-size: 14px;
    color: #cccccc;
    margin-top: 0;
  }

  .signin {
    font-size: 14px;
    text-align: center;
    color: #aaa;
  }

  .signin a {
    color: #4da6ff;
    text-decoration: none;
  }

  .input {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    background-color: #1c1c1c;
    color: white;
    transition: all 0.3s ease;
  }

  .input::placeholder {
    color: #888;
  }

  .input:focus {
    outline: 2px solid #4da6ff;
  }

  .submit {
    margin-top: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .submit:hover {
    background-color: #0056b3;
  }

  .password-wrapper {
    position: relative;
  }

  .eye {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    opacity: 0.6;
    cursor: pointer;
    background: transparent;
    border: none;
    user-select: none;
    font-family: monospace;
    letter-spacing: 2px;
  }

  .eye:hover {
    opacity: 1;
  }
`;
