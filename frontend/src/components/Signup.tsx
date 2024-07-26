import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
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

const SignupContainer = styled.div`
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

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      const response = await axios.post('/create-user', { idToken });
      console.log('User created successfully:', response.data);

      if (response.data.verificationSent) {
        setSuccess('Account created successfully. Please check your email for verification.');
      } else {
        setSuccess('Account created successfully. Please try to verify your email later.');
        await sendEmailVerification(userCredential.user);
      }

      setTimeout(() => navigate('/login'), 5000);
    } catch (error: any) {
      console.error('Error signing up:', error);
      if (error.response) {
        setError(`Server error: ${error.response.data.message || error.response.data.error}`);
      } else if (error.request) {
        setError('No response from server. Please try again.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const response = await axios.post('/create-user', { idToken });
      console.log('User created successfully with Google:', response.data);
      if (result.user.emailVerified) {
        navigate('/welcome');
      } else {
        setSuccess('Account created successfully. Please check your email for verification.');
        setTimeout(() => navigate('/login'), 5000);
      }
    } catch (error: any) {
      console.error("Google sign up failed:", error);
      setError('Google sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Title>Placard</Title>
        <SignupContainer>
          <FormTitle>Create your account</FormTitle>
          <p>
            Already have an account? <StyledLink to="/login">Sign in now</StyledLink>
          </p>
          <Form onSubmit={handleSubmit}>
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
                placeholder="Create a password"
                required
              />
            </Label>
            <Label>
              Confirm Password
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </Label>
            <Button type="submit" disabled={isLoading}>Sign up</Button>
          </Form>
          <GoogleButton onClick={handleGoogleSignup} disabled={isLoading}>Sign up with Google</GoogleButton>
          {isLoading && <p>Loading...</p>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </SignupContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default Signup;