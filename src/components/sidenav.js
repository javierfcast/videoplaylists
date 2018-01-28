import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';

//Import Images
import logo from '../images/logo_videoplaylists.svg';
import logoFacebook from '../images/logo_facebook.svg';
import logoTwitter from '../images/logo_twitter.svg';
import logoInstagram from '../images/logo_instagram.svg';

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

const Aside = styled.div`
  color: #fff;
  min-height: 100vh;
  max-width: 240px;
  background: rgba(0,0,0,0.9);
  border-right: 1px solid rgba(255,255,255,0.1);
  ${media.xmedium`
    min-height: inherit;
    background: none;
    border: none;
  `}
`;
const StyledContainer = styled.div`
  padding: 30px 20px;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  ${media.xmedium`
    height: calc(100vh - 60px);
  `}
`;
const StyledTopContainer = styled.div`
`;
const StyledBottomContainer = styled.div`
`;
const StyledUserInfo = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 40px;
  margin-bottom: 20px;
`;
const StyledUserImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 40px;
`;
const StyledUserName = styled.h4`
  font-size: 24px;
  font-weight: 100;
  margin-bottom: 20px;
`;
const StyledLandingHeading = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 80px;
`;
const StyledLandingLogo = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
`;
const StyledLogo = styled.img`
  width: 26px;
  height: 26px;
  margin-right: 10px;
  display: block;
`;
const StyledLandingTitle = styled.h1`
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 400;
  letter-spacing: 2px;
`;
const StyledLandingDescription = styled.h3`
  margin-bottom: 80px;
`;
const StyledLogin = styled.a`
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1);
  display: block;
  padding: 10px;
  text-align: center;
  transition: all .3s ease;
  margin-bottom: 10px;
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;
const StyledLogout = styled.a`
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
`;
const StyledNavList = styled.ul`
  margin-bottom: 30px;
`;
const StyledNavItemLink = styled(Link)`
  padding: 10px 0;
  cursor: pointer;
  color: #fff;
  display: block;
  text-decoration: none;
`;
const StyledPlaylistContainer = styled.div`
`;
const StyledList = styled.ul`
  margin-bottom: 30px;
`;
const StyledButton = styled.a`
  height: 40px;
  width: 100%;
  display: flex;
  margin-bottom: 20px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all .3s ease;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;
const SecondStyledButton = styled.a`
  height: 40px;
  width: 100%;
  display: flex;
  margin-bottom: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all .3s ease;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;
const StyledTitleLabel = styled.h3`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;
  margin-bottom: 10px;
`;
const StyledLabelLink = styled(Link)`
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  color: #fff;
  margin-bottom: 10px;
  display: block;
  text-decoration: none;
`;
const StyledLabel = styled.p`
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-bottom: 10px;
`;
const StyledSocialList = styled.div`
`;
const StyledSocialLogo = styled.img`
  width: 24px;
  height: 24px;
`;
const StyledSocialLink = styled.a`
  display: inline-block;
  margin-right: 10px;
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
    background-color: rgba(0,0,0,0.2);
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
    background-color: rgba(255,255,255,0.2);
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

const Sidenav = ({ toggleAddPlaylistPopup, toggleInterface, toggleImportPlaylistPopup, importFromSpotify, onImportPlaylistDrop, myPlaylists, followingPlaylists, onLogin, onLogout, user}) => {

  const MyPlaylists = myPlaylists.map((playlist) => {
    return (
      <li key = {playlist.playlistSlugName}>
        <StyledNavItemLink to={`/users/${playlist.AuthorId}/${playlist.playlistId}`}>{playlist.playlistName}</StyledNavItemLink>
      </li>
    )
  });

  const FollowingPlaylists = followingPlaylists.map((playlist) => {
    return (
      <li key={playlist.playlistId}>
        <StyledNavItemLink to={`/users/${playlist.AuthorId}/${playlist.playlistId}?following=true`}>{playlist.playlistName}</StyledNavItemLink>
      </li>
    )
  });

  return (
    <Aside>
      {(user) ? (
        <StyledContainer>
          <StyledTopContainer>
            <StyledUserInfo>
              <StyledUserImg width="100" src={user.photoURL} alt={user.displayName} />
              <p>Hola</p>
              <StyledUserName>{user.displayName || user.email}!</StyledUserName>
              <StyledLogout onClick={onLogout}>Logout</StyledLogout>
              <StyledOptions>
                <StyledInterfaceSwitch>
                  <span className="switch-label">UI Always On</span>
                  <input type="checkbox" onClick={toggleInterface}/>
                  <div className="switch-slider"></div>
                </StyledInterfaceSwitch>
              </StyledOptions>
            </StyledUserInfo>
            <StyledPlaylistContainer>
              <StyledNavList>
                <StyledNavItemLink to="/">Discover</StyledNavItemLink>
                <StyledNavItemLink to={`/users/${user.uid}/library`}>My Library</StyledNavItemLink>
                <StyledNavItemLink to="/users">Recently Active</StyledNavItemLink>
              </StyledNavList>
              <StyledButton onClick={toggleAddPlaylistPopup}>
                <MaterialIcon icon="add" color='#fff' />
                Add new Playlist
              </StyledButton>
              <SecondStyledButton onClick={toggleImportPlaylistPopup} 
                onDrop={(event) => {onImportPlaylistDrop(event)}}
                onDragOver={(e) => e.preventDefault()}>
                <MaterialIcon icon="add" color='#fff' />
                Import from Spotify
              </SecondStyledButton>
              <StyledTitleLabel>My Playlists - {myPlaylists.length}</StyledTitleLabel>
              <StyledList>
                {MyPlaylists}
              </StyledList>
              <StyledTitleLabel>Following - {followingPlaylists.length}</StyledTitleLabel>
              <StyledList>
                {FollowingPlaylists}
              </StyledList> 
            </StyledPlaylistContainer>
          </StyledTopContainer>
          <StyledBottomContainer>
            <StyledLabelLink to="/about">About</StyledLabelLink>
            <StyledLabelLink to="/terms">Terms of Service</StyledLabelLink>
            <StyledLabelLink to="/privacy">Privacy Policy</StyledLabelLink>
            <StyledLabel>Follow Us</StyledLabel>
            <StyledSocialList>
              <StyledSocialLink href="https://facebook.com/videoplaylists" target="_blank" rel="noopener noreferrer"><StyledSocialLogo src={logoFacebook} alt='Logo Facebook' /></StyledSocialLink>
              <StyledSocialLink href="https://twitter.com/videoplaylists" target="_blank" rel="noopener noreferrer"><StyledSocialLogo src={logoTwitter} alt='Logo Twitter' /></StyledSocialLink>
              <StyledSocialLink href="https://instagram.com/videoplaylists" target="_blank" rel="noopener noreferrer"><StyledSocialLogo src={logoInstagram} alt='Logo Instagram' /></StyledSocialLink>
            </StyledSocialList>
          </StyledBottomContainer>
        </StyledContainer>
        ) : (
        <StyledContainer>
          <StyledTopContainer>
            <StyledLandingHeading>
              <StyledLandingLogo>
                <StyledLogo src={logo} alt='VideoPlaylist Logo' />
                <StyledLandingTitle>VideoPlaylists.tv</StyledLandingTitle>
              </StyledLandingLogo>
            </StyledLandingHeading>
            <StyledLandingDescription>Create, share and discover great video playlists.</StyledLandingDescription>
            <StyledNavList>
              <StyledNavItemLink to="/">Discover</StyledNavItemLink>
              <StyledNavItemLink to="/users">Recently Active</StyledNavItemLink>
            </StyledNavList>
            <StyledLogin onClick={() => onLogin('google')}>Login with Google</StyledLogin>
            <StyledLogin onClick={() => onLogin('facebook')}>Login with Facebook</StyledLogin>
          </StyledTopContainer>
          <StyledBottomContainer>
            <StyledLabelLink to="/about">About</StyledLabelLink>
            <StyledLabelLink to="/terms">Terms of Service</StyledLabelLink>
            <StyledLabelLink to="/privacy">Privacy Policy</StyledLabelLink>
            <StyledLabel>Follow Us</StyledLabel>
            <StyledSocialList>
              <StyledSocialLink href="https://facebook.com/videoplaylists" target="_blank" rel="noopener noreferrer"><StyledSocialLogo src={logoFacebook} alt='Logo Facebook' /></StyledSocialLink>
              <StyledSocialLink href="https://twitter.com/videoplaylists" target="_blank" rel="noopener noreferrer"><StyledSocialLogo src={logoTwitter} alt='Logo Twitter' /></StyledSocialLink>
              <StyledSocialLink href="https://instagram.com/videoplaylists" target="_blank" rel="noopener noreferrer"><StyledSocialLogo src={logoInstagram} alt='Logo Instagram' /></StyledSocialLink>
            </StyledSocialList>
          </StyledBottomContainer>
        </StyledContainer>
        )
      }
    </Aside>
  )
}

export default Sidenav;
