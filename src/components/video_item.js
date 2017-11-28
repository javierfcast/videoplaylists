import React from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';


const StyledVideoItem = styled.li`
  padding: 20px 0;
  width: 100%;
  transition: all .3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover{
    background: linear-gradient(45deg, rgba(255,255,255,0) 0%,rgba(255,255,255,0.1) 100%);
  }
  &.active{
    background: linear-gradient(45deg, rgba(255,255,255,0) 0%,rgba(255,255,255,0.1) 100%);
  }
`;
const StyledVideoInfo = styled.a`
  cursor: pointer;
`;
const VideoItemTitle = styled.span`
  display: block;
  width: 100%;
  margin-bottom: 10px;
`;
const VideoChannel = styled.span`
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
`;
const StyledActions = styled.div`
  width: 140px;
  flex: 0 1 auto;
  text-align: right;
`
const StyledActionButton = styled.a`
  cursor: pointer;
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
  opacity: 0;
  ${StyledVideoItem}:hover & {
    opacity: 1;
  }
  ${StyledVideoItem}.active & {
    opacity: 1;
  }
`;



const VideoItem = ({ video, videoTitle, videoEtag, videoId, videoChannel, item, togglePlayer, togglePlaylistPopup, onRemoveFromPlaylist, inSearchResults, currentVideoId}) => {
  
  //If i used (props) i would have to define this variables:
  //const video = props.video;
  //const onVideoPlay = props.onVideoPlay

  return(
    <StyledVideoItem className={currentVideoId === videoId && 'active'}>
      <StyledVideoInfo onClick={() => togglePlayer(video)}>
        <VideoItemTitle>{videoTitle}</VideoItemTitle>
        <VideoChannel>{videoChannel}</VideoChannel>
      </StyledVideoInfo>
      <StyledActions>
        <StyledActionButton onClick={() => togglePlaylistPopup(video)}>
          <MaterialIcon icon="add" color='#fff'/>
        </StyledActionButton>
        {inSearchResults === true &&
          <StyledActionButton onClick={() => onRemoveFromPlaylist(videoId, item)}>
            <MaterialIcon icon="delete_forever"  color='#fff'/>
          </StyledActionButton>
        }
      </StyledActions>
    </StyledVideoItem>
  );
};

export default VideoItem;
