import React from 'react';
import { Link, NavLink } from 'react-router-dom';
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
  padding: 40px 20px 20px;
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

const StyledLandingHeading = styled.div`
  display: flex;
  align-items: center;
`;
const StyledLandingLogo = styled(Link)`
  margin-right: 10px;
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
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
  font-weight: 700;
  letter-spacing: 2px;
  span{
    font-size: 9px;
  }
`;
const StyledLandingDescription = styled.h3`
  margin-top: 80px;
  margin-bottom: 80px;
`;
const StyledLogin = styled.a`
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  width: 100%;
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

const StyledNavList = styled.ul`
  margin: 30px 0;
`;
const StyledNavItemLink = styled(NavLink)`
  padding: 10px 0;
  cursor: pointer;
  display: block;
  text-decoration: none;
  transition: all .3s;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  &:after{
    content: '';
    display: block;
    border-top: 1px solid white;
    width: 16px;
    margin-top: -8px;
    margin-left: -40px;
    transition: all .3s;
  }
  &:hover{
    color: white;
  }
  &.active{
    color: white;
    &:after{
      margin-left: -20px;
    }
  }
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
  margin-bottom: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all .3s ease;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  text-decoration: none;
  color: white;
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
const StyledLabelLink = styled(NavLink)`
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-bottom: 10px;
  display: block;
  text-decoration: none;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  &:after{
    content: '';
    display: block;
    border-top: 1px solid white;
    width: 16px;
    margin-top: -6px;
    margin-left: -40px;
    transition: all .3s;
  }
  &:hover{
    color: white;
  }
  &.active{
    &:after{
      margin-left: -20px;
    }
  }
  ${props => props.last && css`
    margin-bottom: 40px;
  `}
`;
const StyledLabel = styled.p`
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-bottom: 10px;
`;
const StyledSocialList = styled.div`
  margin-bottom: 30px;
`;
const StyledSocialLogo = styled.img`
  width: 24px;
  height: 24px;
`;
const StyledSocialLink = styled.a`
  display: inline-block;
  margin-right: 10px;
  opacity: .6;
  transition: all .3s;
  &:hover{
    opacity: 1;
  }
`;

const Sidenav = ({ toggleAddPlaylistPopup, importFromSpotify, onImportPlaylistDrop, myPlaylists, followingPlaylists, onLogin, user}) => {

  const MyPlaylists = myPlaylists.map((playlist) => {
    return (
      <li key = {playlist.playlistId}>
        <StyledNavItemLink to={`/users/${playlist.AuthorId}/${playlist.playlistId}`} exact activeClassName="active">{playlist.playlistName}</StyledNavItemLink>
      </li>
    )
  });

  const FollowingPlaylists = followingPlaylists.map((playlist) => {
    return (
      <li key={playlist.playlistId}>
        <StyledNavItemLink to={`/users/${playlist.AuthorId}/${playlist.playlistId}`} activeClassName="active">{playlist.playlistName}</StyledNavItemLink>
      </li>
    )
  });

  return (
    <Aside>
      {(user) ? (
        <StyledContainer>
          <StyledTopContainer>
            <StyledLandingHeading>
              <StyledLandingLogo to="/">
                <StyledLogo src={logo} alt='VideoPlaylist Logo' />
                <StyledLandingTitle>VideoPlaylists.tv<br /><span>Beta</span></StyledLandingTitle>
              </StyledLandingLogo>
            </StyledLandingHeading>
            <StyledPlaylistContainer>
              <StyledNavList>
                <StyledNavItemLink to="/" exact activeClassName="active">Discover</StyledNavItemLink>
                <StyledNavItemLink to="/tags" exact activeClassName="active">Search By Tag</StyledNavItemLink>
                <StyledNavItemLink to={`/users/${user.uid}/library`} exact activeClassName="active">My Library</StyledNavItemLink>
                <StyledNavItemLink to={`/likedyoutube`} exact activeClassName="active">Liked on YouTube</StyledNavItemLink>
                <StyledNavItemLink to="/users" exact activeClassName="active">Recently Active</StyledNavItemLink>
              </StyledNavList>
              <StyledButton onClick={toggleAddPlaylistPopup}
                onDrop={(event) => {onImportPlaylistDrop(event)}}
                onDragOver={(e) => e.preventDefault()}>
                <MaterialIcon icon="add" color='#fff' />
                Add new Playlist
              </StyledButton>
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
            <StyledLabelLink to="/about" exact activeClassName="active">About</StyledLabelLink>
            <StyledLabelLink to="/terms" exact activeClassName="active">Terms of Service</StyledLabelLink>
            <StyledLabelLink last={1} to="/privacy" exact activeClassName="active">Privacy Policy</StyledLabelLink>
            <StyledLabel>Follow Us</StyledLabel>
            <StyledSocialList>
              <StyledSocialLink href="https://facebook.com/videoplaylists" target="_blank" rel="noopener noreferrer"><StyledSocialLogo src={logoFacebook} alt='Logo Facebook' /></StyledSocialLink>
              <StyledSocialLink href="https://twitter.com/videoplaylists" target="_blank" rel="noopener noreferrer"><StyledSocialLogo src={logoTwitter} alt='Logo Twitter' /></StyledSocialLink>
              <StyledSocialLink href="https://instagram.com/videoplaylists" target="_blank" rel="noopener noreferrer"><StyledSocialLogo src={logoInstagram} alt='Logo Instagram' /></StyledSocialLink>
            </StyledSocialList>
            <StyledLabel>Download apps</StyledLabel>
            <StyledButton href="https://www.dropbox.com/s/zlgq963yn5k7o4u/videoplaylists.tv.dmg?dl=1" target="_blank"><i class=""></i> Mac desktop app</StyledButton>
          </StyledBottomContainer>
        </StyledContainer>
        ) : (
        <StyledContainer>
          <StyledTopContainer>
            <StyledLandingHeading>
              <StyledLandingLogo to="/">
                <StyledLogo src={logo} alt='VideoPlaylist Logo' />
                <StyledLandingTitle>VideoPlaylists.tv<br /><span>Beta</span></StyledLandingTitle>
              </StyledLandingLogo>
            </StyledLandingHeading>
            <StyledLandingDescription>Create, share and discover great video playlists.</StyledLandingDescription>
            <StyledNavList>
              <StyledNavItemLink to="/" exact activeClassName="active">Discover</StyledNavItemLink>
              <StyledNavItemLink to="/tags" exact activeClassName="active">Search By Tag</StyledNavItemLink>
              <StyledNavItemLink to={`/likedyoutube`} exact activeClassName="active">Liked on YouTube</StyledNavItemLink>  
              <StyledNavItemLink to="/users" exact activeClassName="active">Recently Active</StyledNavItemLink>
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
