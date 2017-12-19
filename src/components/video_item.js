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
  margin-top: 10px;
  margin-bottom: 10px;
`;
const VideoMeta = styled.span`
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



const VideoItem = ({ user, video, videoTitle, videoEtag, videoId, videoChannel, datePublished, item, togglePlayer, toggleSearchPlayer, togglePlaylistPopup, onRemoveFromPlaylist, inSearchResults, currentVideoId}) => {
  
  //If i used (props) i would have to define this variables:
  //const video = props.video;
  //const onVideoPlay = props.onVideoPlay
  
  const AuthorId = typeof item !== 'undefined' ? item.AuthorId : null;

  let deleteButton = null;

  let addButton = <StyledActionButton onClick={() => togglePlaylistPopup(video)}>
    <MaterialIcon icon="add" color='#fff' />
  </StyledActionButton>

  let videoTrigger = null;

  if (inSearchResults === true) {
    videoTrigger = 
      <StyledVideoInfo onClick={() => toggleSearchPlayer(video)}>
        <VideoMeta>{videoChannel}</VideoMeta>
        <VideoItemTitle>{videoTitle}</VideoItemTitle>
        <VideoMeta>Published: {datePublished}</VideoMeta>
      </StyledVideoInfo>
  } else {
    videoTrigger = 
      <StyledVideoInfo onClick={() => togglePlayer(video)}>
        <VideoMeta>{videoChannel}</VideoMeta>
        <VideoItemTitle>{videoTitle}</VideoItemTitle>
        <VideoMeta>Published: {datePublished}</VideoMeta>
      </StyledVideoInfo>
  }

  if (user !== null) {
    if (inSearchResults === true || user.uid !== AuthorId) {
      deleteButton = null
    } else {
      deleteButton = <StyledActionButton onClick={() => onRemoveFromPlaylist(videoId, item)}>
        <MaterialIcon icon="delete_forever" color='#fff' />
      </StyledActionButton>
    }
  } 

  return(
    <StyledVideoItem className={currentVideoId === videoId && 'active'}>
      {videoTrigger}
      <StyledActions>
        {addButton}
        {deleteButton}
      </StyledActions>
    </StyledVideoItem>
  );
};

export default VideoItem;
