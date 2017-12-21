import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';

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
    background: none;
    border: none;
  `}
`;
const StyledUserInfo = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 20px;
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
const StyledLanding = styled.div`
  padding: 40px 20px;
`;
const StyledLandingHeading = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 80px;
`;
const StyledLandingLogo = styled.div`
  margin-right: 10px;
`;
const StyledLandingTitle = styled.h1`
  font-size: 14px;
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
  padding: 10px 20px;
  margin-top: 80px;
  display: block;
  text-align: center;
  transition: all .3s ease;
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
const StyledNavItem = styled.li`
  padding: 10px 0;
  cursor: pointer;
`;
const StyledNavItemLink = styled(Link)`
  padding: 10px 0;
  cursor: pointer;
  color: #fff;
  display: block;
  text-decoration: none;
`;
const StyledPlaylistContainer = styled.div`
  padding: 20px;
`;
const StyledList = styled.ul`
  margin-bottom: 30px;
`;
const StyledPlaylistLink = styled.a`
  padding: 10px 0;
  display: block;
  cursor: pointer;
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

const Sidenav = ({ toggleAddPlaylistPopup, onBrowse, onPlaylistSelect, myPlaylists, followingPlaylists, onLogin, onLogout, user}) => {

  const PlaylistItem = myPlaylists.map((item) => {
    return (
      <li key = {item.playlistSlugName}>
        <StyledPlaylistLink onClick={() => onPlaylistSelect(item)}>{item.playlistName}</StyledPlaylistLink>
      </li>
    )
  });

  const FollowingItem = followingPlaylists.map((item) => {
    return (
      <li key={item.playlistId}>
        <StyledPlaylistLink onClick={() => onPlaylistSelect(item)}>{item.playlistName}</StyledPlaylistLink>
      </li>
    )
  });

  return (
    <Aside>
      {(user) ? (
        <div>
          <StyledUserInfo>
            <StyledUserImg width="100" src={user.photoURL} alt={user.displayName} />
            <p>Hola</p>
            <StyledUserName>{user.displayName || user.email}!</StyledUserName>
            <StyledLogout onClick={onLogout}>Logout</StyledLogout>
          </StyledUserInfo>
          <StyledPlaylistContainer>
            <StyledNavList>
              <StyledNavItem onClick={onBrowse}>Browse</StyledNavItem>
              <StyledNavItemLink to="/users">Recently Active</StyledNavItemLink>
            </StyledNavList>
            <StyledButton onClick={toggleAddPlaylistPopup}>
              <MaterialIcon icon="add" color='#fff' />
              Add new Playlist
            </StyledButton>
            <StyledTitleLabel>My Playlists - {myPlaylists.length}</StyledTitleLabel>
            <StyledList>
              {PlaylistItem}
            </StyledList>
            <StyledTitleLabel>Following - {followingPlaylists.length}</StyledTitleLabel>
            <StyledList>
              {FollowingItem}
            </StyledList> 
          </StyledPlaylistContainer>
        </div>
        ) : (
        <StyledLanding>
          <StyledLandingHeading>
            <StyledLandingLogo>
              <MaterialIcon icon="playlist_play" color='#fff' size='medium'/>
            </StyledLandingLogo>
            <StyledLandingTitle>Video Playlists</StyledLandingTitle>
          </StyledLandingHeading>
          <StyledLandingDescription>Create, share and discover great video playlists.</StyledLandingDescription>
          <StyledLogin onClick={onLogin}>Log In with Google</StyledLogin>
        </StyledLanding>
        )
      }

    </Aside>
  )
}

export default Sidenav;
