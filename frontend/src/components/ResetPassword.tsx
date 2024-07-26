import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Make sure this path is correct

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Sirkin+Sans&display=swap');
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body, html {
    font-family: 'Sirkin Sans', sans-serif;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
`;

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
  max-width: 100%;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 3em;
  margin-bottom: 20px;
`;

const ResetContainer = styled.div`
  width: 100%;
  max-width: 400px;
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

const Message = styled.p<{ isError?: boolean }>`
  margin-top: 10px;
  color: ${props => props.isError ? '#ff6b6b' : '#51cf66'};
`;

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
      setIsError(false);
      setTimeout(() => navigate('/login'), 3000); // Redirect to login page after 3 seconds
    } catch (error: any) {
      console.error("Password reset error:", error);
      setMessage(error.message || 'An error occurred. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <ContentWrapper>
          <Title>pBee.ai</Title>
          <ResetContainer>
            <FormTitle>Reset your password</FormTitle>
            <Form onSubmit={handleSubmit}>
              <Label>
                Email
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Label>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send reset link'}
              </Button>
            </Form>
            {message && <Message isError={isError}>{message}</Message>}
            <StyledLink to="/login">Back to sign in</StyledLink>
          </ResetContainer>
        </ContentWrapper>
      </PageContainer>
    </>
  );
};

export default ResetPassword;