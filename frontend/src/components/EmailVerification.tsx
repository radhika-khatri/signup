import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to right, #0f0c29, #302b63, #24243e);
  color: white;
`;

const Message = styled.p`
  font-size: 1.2em;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1em;
  background-color: #6c63ff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const EmailVerification: React.FC = () => {
  const [message, setMessage] = useState('Verifying your email...');
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');

      if (!token) {
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/api/verify-email?token=${token}`);
        console.log('Verification response:', response.data);
        setMessage(response.data.message);
        setIsVerified(true);
      } catch (error: any) {
        console.error('Verification error:', error.response?.data || error.message);
        setMessage(error.response?.data?.error || 'An error occurred while verifying your email. Please try again.');
      }
    };

    verifyEmail();
  }, [location]);

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <Container>
      <Message>{message}</Message>
      {isVerified && <Button onClick={handleNavigateToLogin}>Go to Login</Button>}
    </Container>
  );
};

export default EmailVerification;