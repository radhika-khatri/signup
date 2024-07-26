import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to right, #0f0c29, #302b63, #24243e);
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5em;
  margin-bottom: 20px;
`;

const LogoutButton = styled.button`
  padding: 10px 20px;
  font-size: 1em;
  background-color: #6c63ff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #524dff;
  }
`;

const UserEmail = styled.p`
  font-size: 1.2em;
  margin-bottom: 20px;
`;

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await axios.post('http://localhost:3001/api/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <WelcomeContainer>
      <Title>Welcome! You've been signed in!</Title>
      {currentUser && <UserEmail>Logged in as: {currentUser.email}</UserEmail>}
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
    </WelcomeContainer>
  );
};

export default Welcome;