import { FC, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWFVJYIA44Hom-Zkvpc19wjwOVbWyzZlw",
  authDomain: "user-authentication-aeb33.firebaseapp.com",
  projectId: "user-authentication-aeb33",
  storageBucket: "user-authentication-aeb33.appspot.com",
  messagingSenderId: "760336494344",
  appId: "1:760336494344:web:58e8ef5594ea2fb88886bd",
  measurementId: "G-PPT1404HMB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Sirkin+Sans&display=swap');

  body {
    font-family: 'Sirkin Sans', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
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
  font-family: "Sirkin Sans", sans-serif;
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

const RegistrationContainer = styled.div`
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

const Link = styled.a`
  margin-top: 10px;
  color: #6c63ff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const GoogleButtonWrapper = styled.div`
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Signup: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleGoogleSignupSuccess = (response: any) => {
    console.log("Google sign up success:", response);
  };

  const handleGoogleSignupError = () => {
    console.log("Google sign up failed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await sendEmailVerification(userCredential.user);

      await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ email, password }),
      });

      alert('User signed up successfully! Please check your email for verification.');
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Error signing up');
    }
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <GlobalStyle />
      <PageContainer>
        <ContentWrapper>
          <Title>Placard</Title>
          <RegistrationContainer>
            <FormTitle>Create your account</FormTitle>
            <p>
              Already have an account? <Link href="#">Sign in now</Link>
            </p>
            <Form onSubmit={handleSubmit}>
              <Label>
                Email
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Label>
              <Label>
                Password
                <Input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Label>
              <Label>
                Confirm Password
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Label>
              <Button type="submit">Sign up</Button>
            </Form>
            <GoogleButtonWrapper>
              <GoogleLogin
                onSuccess={handleGoogleSignupSuccess}
                onError={handleGoogleSignupError}
              />
            </GoogleButtonWrapper>
          </RegistrationContainer>
        </ContentWrapper>
      </PageContainer>
    </GoogleOAuthProvider>
  );
};

export default Signup;
