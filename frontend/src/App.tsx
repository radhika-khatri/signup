import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import ResetPassword from './components/ResetPassword';
import Welcome from './components/Welcome';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/welcome" 
            element={
              <PrivateRoute>
                <Welcome />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate replace to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;