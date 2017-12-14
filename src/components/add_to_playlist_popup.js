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
  margin-top: 40px;
  height: 40px;
  line-height: 40px;
  display: inline-block;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0 20px;
  transition: all .3s ease;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;

const AddToPlaylistPopup = ({video, videoTitle, onAddToPlaylist, open, onClose, myPlaylists}) => {

  if (!open) {
    return null;
  }

  if(!video){
    console.log(video);
    return(
      <StyledPopup>
        <h3>loading...</h3>
        <StyledButton onClick={onClose}>
          Close
        </StyledButton>
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

  return(
    <StyledPopup>
      <StyledContent>
        <StyledTitle>Add: {videoTitle} to a playlist</StyledTitle>
        <StyledTitleLabel>My Playlists - {myPlaylists.length}</StyledTitleLabel>
        <ul>
          {PlaylistItem}
        </ul>
        <StyledButton onClick={onClose}>
          Cancel
        </StyledButton>
      </StyledContent>
    </StyledPopup>
  );

}

export default AddToPlaylistPopup;