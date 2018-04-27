import React from 'react';
import styled from 'styled-components';

const shell = typeof window.require === 'function' ? window.require("electron").shell : null;

const StyledPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  padding: 20px;
  z-index: 999;
`;
const StyledContent = styled.div`
  position: relative;
  z-index: 101;
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
const StyledButtonLink = styled.a`
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
  text-decoration: none;
`;
const StyledClickOutside = styled.div`
  position: absolute;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const UpdatePopup = ({ open, onClose, setSnackbar }) => {

  if (!open) {
    return null;
  }

  const onUpdate = () => {
    if (!shell) {setSnackbar("Something went wrong, try again later.")}
    else shell.openExternal('https://drive.google.com/uc?export=download&id=1hBdLnzs7yCaOSpEX-FK-p-BlW3KjbfBN');

    onClose()
  }

  return(
    <StyledPopup>
      <StyledContent>
        <StyledTitle>Update</StyledTitle>
        <p>There's an update available, download it to get the latest features.</p>
        <StyledButtonLink onClick={onUpdate}>
          Download update
        </StyledButtonLink>
        <StyledButton onClick={onClose}>
          Later
        </StyledButton>
      </StyledContent>
      <StyledClickOutside onClick={onClose} />
    </StyledPopup>
  );
}

export default UpdatePopup;