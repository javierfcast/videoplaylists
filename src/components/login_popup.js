import React from 'react';
import styled from 'styled-components';

const StyledPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  padding: 20px;
`;
const StyledContent = styled.div`
  max-width: 480px;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 40px;
  margin: 0 auto;
  background: rgba(0,0,0,0.9);
`;
const StyledTitle = styled.h2`
  margin-bottom: 40px;
  font-size: 18px;
`;
const StyledButton = styled.a`
  height: 40px;
  width: 90px;
  line-height: 40px;
  display: block;
  margin: 0 auto;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 0 20px;
  transition: all .3s ease;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  &:hover{
    border-bottom: 1px solid rgba(255,255,255,1);
  }
`;
const StyledButtonSubmit = styled.a`
  text-align: center;
  width: 100%;
  margin-top: 40px;
  margin-bottom: 10px;
  height: 40px;
  line-height: 40px;
  display: inline-block;
  border-radius: 0;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0 20px;
  transition: all .3s ease;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  background: linear-gradient(45deg, rgba(68,70,181,0.6) 0%,rgba(74,0,114,0.8) 100%);
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;

const LoginPopup = ({ user, onLogin, open, onClose }) => {

  if (!open) {
    return null;
  }

  if (!user) {
    return(
      <StyledPopup>
        <StyledContent>
          <StyledTitle>Login</StyledTitle>
          <p>You need to create an account in order to create and follow playlists, save videos and more.</p>
          <StyledButtonSubmit onClick={onLogin}>
            Login with Google
          </StyledButtonSubmit>
          <StyledButton onClick={onClose}>
            Cancel
          </StyledButton>
        </StyledContent>
      </StyledPopup>
    );
  }
}

export default LoginPopup;