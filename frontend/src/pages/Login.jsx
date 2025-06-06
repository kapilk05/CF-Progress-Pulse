import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../components/ThemeContext';
import { AuthContext } from '../components/AuthContext';

const Login = () => {
  const { isDark } = useContext(ThemeContext);
  const { fetchUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });

      localStorage.setItem('token', res.data.access_token);
      setMsg('Login successful!');
      await fetchUser(); // update global user
      navigate('/'); // redirect to homepage
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <PageWrapper>
      <StyledWrapper>
        <form className="form" onSubmit={handleLogin}>
          <p className="title">Sign In</p>
          <p className="message">Login to your account</p>

          <label>
            <input
              required
              placeholder="Email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="password-wrapper">
            <input
              required
              placeholder="Password"
              className="input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            />
          </label>

          {msg && <p className="message">{msg}</p>}

          <button className="submit">Login</button>
          <p className="signup">
            Don't have an account? <a href="/register">Sign Up</a>
          </p>
        </form>
      </StyledWrapper>
    </PageWrapper>
  );
};

export default Login;


const PageWrapper = styled.div`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 400px;
    padding: 30px;
    background: ${({ theme }) =>
      theme.isDark
        ? 'linear-gradient(145deg, #1e1e1e, #2a2a2a)'
        : 'linear-gradient(145deg, #f0f0f0, #e0e0e0)'};
    border-radius: 20px;
    box-shadow: ${({ theme }) =>
      theme.isDark
        ? '0 0 20px rgba(0, 123, 255, 0.4)'
        : '0 0 20px rgba(0, 0, 0, 0.1)'};
    font-family: 'Segoe UI', sans-serif;
    color: ${({ theme }) => theme.color};
    transition: all 0.3s ease;
  }

  .title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 5px;
    color: ${({ theme }) => theme.color};
  }

  .message {
    font-size: 14px;
    color: ${({ theme }) => (theme.isDark ? '#cccccc' : '#555')};
  }

  .signup {
    font-size: 14px;
    text-align: center;
    color: ${({ theme }) => (theme.isDark ? '#aaa' : '#666')};
  }

  .signup a {
    color: #4da6ff;
    text-decoration: none;
  }

  .input {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    background-color: ${({ theme }) => (theme.isDark ? '#1c1c1c' : '#fff')};
    color: ${({ theme }) => theme.color};
    transition: all 0.3s ease;
    box-shadow: ${({ theme }) =>
      theme.isDark ? 'none' : '0 0 5px rgba(0,0,0,0.1)'};
  }

  .input::placeholder {
    color: ${({ theme }) => (theme.isDark ? '#888' : '#aaa')};
  }

  .input:focus {
    outline: 2px solid #4da6ff;
  }

  .submit {
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

  /* Custom eye icon */
  .eye {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 14px;
    cursor: pointer;
    opacity: 0.6;
    user-select: none;

    border: 2px solid ${({ theme }) => theme.color};
    border-radius: 12px / 7px;
    background: transparent;
    box-sizing: border-box;
  }

  .eye::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: ${({ theme }) => theme.color};
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .eye:hover {
    opacity: 1;
  }
`;
