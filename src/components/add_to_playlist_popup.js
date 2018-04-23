import React from 'react';
import styled from 'styled-components';

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
  p{
    margin-bottom: 40px;
  }
`;
const StyledLink = styled.a`
  padding: 10px 0;
  display: block;
  cursor: pointer;
`;
const StyledTitle = styled.h2`
  margin-bottom: 40px;
  font-size: 18px;
`;
const StyledTitleLabel = styled.h3`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;
  margin-bottom: 10px;
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
const StyledClickOutside = styled.div`
  position: absolute;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const AddToPlaylistPopup = ({ user, onLogin, video, onAddToPlaylist, onAddToLibrary, open, onClose, myPlaylists }) => {

  if (!open) {
    return null;
  }

  if(!video){
    return(
      <StyledPopup>
        <h3>loading...</h3>
        <StyledButton onClick={onClose}>
          Close
        </StyledButton>
      </StyledPopup>
    );
  }

  if (!user) {
    return(
      <StyledPopup>
        <StyledContent>
          <StyledTitle>Login</StyledTitle>
          <p>You need to create an account in order to create playlists and add videos to them.</p>
          <StyledButtonSubmit onClick={() => onLogin('google')}>Login with Google</StyledButtonSubmit>
          <StyledButtonSubmit onClick={() => onLogin('facebook')}>Login with Facebook</StyledButtonSubmit>
          <StyledButton onClick={onClose}>
            Cancel
          </StyledButton>
        </StyledContent>
      </StyledPopup>
    );
  }

  const PlaylistItem = myPlaylists.map((item) => {
    return (
      <li key={item.playlistSlugName}>
        <StyledLink onClick={() => onAddToPlaylist(video, item)}>{item.playlistName}</StyledLink>
      </li>
    )
  });

  const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;

  return(
    <StyledPopup>
      <StyledContent>
        <StyledTitle>Add: {videoTitle} to a playlist</StyledTitle>
        <StyledLink style={{ marginBottom: 20 + 'px' }} onClick={() => onAddToLibrary(video)}>Add to library</StyledLink>
        <StyledTitleLabel>My Playlists - {myPlaylists.length}</StyledTitleLabel>
        <ul>
          {PlaylistItem}
        </ul>
        <StyledButton onClick={onClose}>
          Cancel
        </StyledButton>
      </StyledContent>
      <StyledClickOutside onClick={onClose} />
    </StyledPopup>
  );

}

export default AddToPlaylistPopup;