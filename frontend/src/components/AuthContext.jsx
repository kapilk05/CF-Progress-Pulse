import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/current_user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // ✅ Required for CORS with JWT
      });
      setUser(res.data.user);
    } catch (err) {
      console.error('Error fetching user:', err.response?.data || err.message);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
