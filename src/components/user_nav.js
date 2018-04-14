import React from 'react';
import styled from 'styled-components';
import { css } from 'styled-components';
// import MaterialIcon from 'material-icons-react';

const sizes = {
  small: 360,
  xmedium: 720,
  xlarge: 1200
}

// Iterate through the sizes and create a media template
const media = Object.keys(sizes).reduce((acc, label) => {
  acc[label] = (...args) => css`
		@media (min-width: ${sizes[label] / 16}em) {
			${css(...args)}
		}
	`

  return acc
}, {})

const StyledUserNavLink = styled.a`
  cursor: pointer;
  display: block;
  color: white;
  text-decoration: none;
  &:focus{
    pointer-events: none;
  }
`;
const StyledUserTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px;
  span{
    font-size: 14px;  
    margin-right: 10px;
    white-space: nowrap;
  }
`; 
const StyledUserDropodwn = styled.div`
  position: absolute;
  background: rgba(0,0,0,0.9);
  width: 220px;
  padding: 20px;
  right: 0;
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition: all .5s;
  ${StyledUserNavLink}:focus & {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
`;
const StyledUserImg = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  ${props => props.inner && css`
    width: 40px;
    height: 40px;
    margin-bottom: 40px;
  `}
`;
const StyledUserName = styled.h4`
  font-size: 24px;
  font-weight: 100;
  margin-bottom: 20px;
`;
const StyledLogout = styled.span`
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
`;
const StyledOptions = styled.div`
  border-top: 1px solid rgba(255,255,255,0.1);
  margin-top: 20px;
`;
const StyledInterfaceSwitch = styled.label`
  padding: 10px 0;
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  input{
    display: none;
  }
  .switch-slider{
    cursor: pointer;
    width: 40px;
    height: 24px;
    background-color: rgba(255,255,255,0.2);
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 24px;
    position: relative;
    &:before{
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
      border-radius: 50%;
    }
  }
  .switch-label{
    transition: all .3s ease;
  	text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 2px;
  }
  input:checked + .switch-slider {
    background-color: #71198E;
  }
  input:focus + .switch-slider {
    box-shadow: 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12), 0 2px 4px -1px rgba(0,0,0,.2);
  }
  input:checked + .switch-slider:before {
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
  }
`;

const UserNav = ({ onLogout, user, toggleInterface }) => {
  return (
    <div>
      {(user) ? (
        <StyledUserNavLink tabindex="0" href="#">
          <StyledUserTrigger>
            <span>{user.displayName || user.email}</span>
            <StyledUserImg width="100" src={user.photoURL} alt={user.displayName} />
          </StyledUserTrigger>
          <StyledUserDropodwn>
            <StyledUserImg inner width="100" src={user.photoURL} alt={user.displayName} />
            <p>Hola</p>
            <StyledUserName>{user.displayName || user.email}!</StyledUserName>
            <StyledLogout onClick={onLogout}>Logout</StyledLogout>
            <StyledOptions>
              <StyledInterfaceSwitch>
                <span className="switch-label">UI Always On</span>
                <input type="checkbox" onClick={toggleInterface} />
                <div className="switch-slider"></div>
              </StyledInterfaceSwitch>
            </StyledOptions>
          </StyledUserDropodwn>
        </StyledUserNavLink>
        ) : (
          <div>
          </div>
        )
      }
    </div>
  )
}

export default UserNav;