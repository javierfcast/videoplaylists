import React from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';
import { Link } from 'react-router-dom';

const StyledPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  padding: 20px;
  z-index: 100;
`;
const StyledContent = styled.div`
  max-width: 480px;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 40px;
  margin: 0 auto;
  background: rgba(0,0,0,0.9);
  p{
    margin-bottom: 40px;
  }
  hr{
    background: none;
    border: none;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
`;
const StyledTitle = styled.h2`
  margin-bottom: 10px;
  font-size: 18px;
`;
const StyledTitleLabel = styled.h3`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;
  margin-bottom: 40px;
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
const StyledAction = styled.a`
  padding: 10px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 0;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 2px;
  opacity: .6;
  transition: all .3s ease;
  &:hover{
    opacity: 1;
  }
  .material-icons{
    margin-right: 10px;
  }
`;
const StyledLink = styled(Link)`
  padding: 10px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 0;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 2px;
  opacity: .6;
  transition: all .3s ease;
  &:hover{
    opacity: 1;
  }
  .material-icons{
    margin-right: 10px;
  }
`;

const VideoOptionsPopup = ({ open, video, remove, onClose, playlist, togglePlaylistPopup, onRemoveFromPlaylist, onShare }) => {

  if (!open) {
    return null;
  }

  return (
    <StyledPopup>
      <StyledContent>
        <StyledTitle>{video.videoTitle}</StyledTitle>
        <StyledTitleLabel>{video.videoChannel}</StyledTitleLabel>
        <StyledAction onClick={() => togglePlaylistPopup(video)}><MaterialIcon icon="playlist_add" color='#fff' /> Add to playlist</StyledAction>
        <StyledLink to={`/watch/${video.videoID}`} ><MaterialIcon icon="music_video" color='#fff' /> Start radio</StyledLink>
        <StyledAction onClick={() => onShare(video)} ><MaterialIcon icon="share" color='#fff' /> Share</StyledAction>
        <hr />
        {remove ? <StyledAction onClick={() => onRemoveFromPlaylist(video.videoID, playlist)} ><MaterialIcon icon="delete_forever" color='#fff' /> Remove</StyledAction> : null}
        <StyledButton onClick={onClose}>
          Cancel
        </StyledButton>
      </StyledContent>
    </StyledPopup>
  );
}

export default VideoOptionsPopup;