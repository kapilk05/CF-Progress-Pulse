import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';  // Import Profile page

import { ThemeContext, ThemeContextProvider } from './components/ThemeContext';
import { AuthProvider } from './components/AuthContext';
import Navbar from './components/Navbar';

const AppContent = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <AppWrapper>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />  {/* Added Profile Route */}
            </Routes>
          </AppWrapper>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
};

export default App;

const AppWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  transition: all 0.3s ease-in-out;
`;
