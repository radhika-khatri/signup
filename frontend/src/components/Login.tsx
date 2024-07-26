import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import axios from '../utils/axios';

const PageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to right, #0f0c29, #302b63, #24243e);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 3em;
  margin-bottom: 20px;
`;

const LoginContainer = styled.div`
  width: 400px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const FormTitle = styled.h2`
  margin-bottom: 10px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Label = styled.label`
  width: 100%;
  margin: 10px 0;
  text-align: left;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: none;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  border: none;
  border-radius: 5px;
  background-color: #6c63ff;
  color: white;
  cursor: pointer;
  font-size: 1em;
`;

const StyledLink = styled(Link)`
  margin-top: 10px;
  color: #6c63ff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const GoogleButton = styled(Button)`
  background-color: #4285F4;
  margin-top: 10px;
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  margin-top: 10px;
`;

const SuccessMessage = styled.p`
  color: #51cf66;
  margin-top: 10px;
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (idToken: string) => {
    try {
      const response = await axios.post('/login', { idToken });
      console.log('Login response:', response.data);
      navigate('/welcome');
    } catch (error: any) {
      console.error("Error in handleLogin:", error.response?.data || error.message);
      if (error.response?.status === 403) {
        setError('Email not verified. Please check your email for the verification link.');
        setSuccess('A new verification email has been sent.');
      } else {
        setError(error.response?.data?.error || 'An error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        setError('Email not verified. Please check your email for the verification link.');
        setSuccess('A new verification email has been sent.');
        setIsLoading(false);
        return;
      }
      const idToken = await userCredential.user.getIdToken();
      await handleLogin(idToken);
    } catch (error: any) {
      console.error("Email login error:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await handleLogin(idToken);
    } catch (error: any) {
      console.error("Google login failed:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Title>pBee.ai</Title>
        <LoginContainer>
          <FormTitle>Sign in to Placard</FormTitle>
          <p>
            Don't have an account? <StyledLink to="/signup">Create one now</StyledLink>
          </p>
          <Form onSubmit={handleEmailLogin}>
            <Label>
              Email
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </Label>
            <Label>
              Password
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </Label>
            <Button type="submit" disabled={isLoading}>Sign in</Button>
          </Form>
          <StyledLink to="/reset-password">Forgot your password? Reset it now</StyledLink>
          <GoogleButton onClick={handleGoogleLogin} disabled={isLoading}>Sign in with Google</GoogleButton>
          {isLoading && <p>Loading...</p>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </LoginContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default Login;