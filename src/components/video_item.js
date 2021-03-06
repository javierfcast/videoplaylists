import React from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';
import Moment from 'moment';

const StyledVideoItem = styled.li`
  padding: 20px 0;
  width: 100%;
  display: flex;
  align-items: center;
  &:hover{
    background: linear-gradient(45deg, rgba(255,255,255,0) 0%,rgba(255,255,255,0.1) 100%);
  }
  &.active{
    background: linear-gradient(45deg, rgba(255,255,255,0) 0%,rgba(255,255,255,0.3) 100%);
    border-bottom: 1px solid #fff;
  }
`;
const StyledContent = styled.div`
  transition: all .3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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
  min-width: 110px;
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
const StyledDragHandle = styled.span`
  cursor: grab;
  width: 24px;
  margin-right: 12px;
`;
const StyledLibraryButton = styled.a`
  cursor: pointer;
  width: 24px;
  flex: 0 1 auto;
  margin-right: 12px;
`;
const StyledLibraryButtonCheck = styled.a`
  cursor: pointer;
  width: 24px;
  flex: 0 1 auto;
  margin-right: 12px;
  height: 24px;
  overflow: hidden;
  position: relative;
  span{
    transition: all .3s;
    position: absolute;
    top: 0;
  }
  &:hover{
    span:first-child{
      top: -26px;
    }
  }
`

const VideoItem = ({ user, playlist, playlistVideos, video, videoTitle, videoEtag, videoId, videoChannel, datePublished, duration, togglePlayer, toggleSearchPlayer, togglePlaylistPopup, onAddToPlaylist, onRemoveFromPlaylist, inSearchResults, currentVideoId, autoAdd, orderBy, itsOnLibrary, onAddToLibrary, onRemoveFromLibrary, inRelatedVideos, inLibraryVideos, reorder}) => {
  
  const durationFormated = Moment.duration(duration).asMilliseconds() > 3600000
    ? Moment.utc(Moment.duration(duration).asMilliseconds()).format("hh:mm:ss")
    : Moment.utc(Moment.duration(duration).asMilliseconds()).format("mm:ss")
  
  const AuthorId = typeof playlist !== 'undefined' ? playlist.AuthorId : null;
  const extraMeta = duration ? " · Duration: " + durationFormated : null; 
    
  let deleteButton = null;

  let addButton = <StyledActionButton onClick={() => togglePlaylistPopup(video)}>
    <MaterialIcon icon="playlist_add" color='#fff' />
  </StyledActionButton>
  if (autoAdd) addButton = <StyledActionButton onClick={() => onAddToPlaylist(video, playlist, autoAdd)}>
    <MaterialIcon icon="playlist_add" color='#fff' />
  </StyledActionButton>

  let videoTrigger = null;

  if (inSearchResults === true) {
    videoTrigger = 
      <StyledVideoInfo onClick={() => toggleSearchPlayer(video)}>
        <VideoMeta>{videoChannel}</VideoMeta>
        <VideoItemTitle>{videoTitle}</VideoItemTitle>
        <VideoMeta>Published: {datePublished}{extraMeta}</VideoMeta>
      </StyledVideoInfo>
  } else {
    videoTrigger = 
      <StyledVideoInfo onClick={() => togglePlayer(video, playlist, playlistVideos)}>
        <VideoMeta>{videoChannel}</VideoMeta>
        <VideoItemTitle>{videoTitle}</VideoItemTitle>
        <VideoMeta>Published: {datePublished}{extraMeta}</VideoMeta>
      </StyledVideoInfo>
  }

  let libraryButton = null;

  //Add to library button
  if (user !== null) {
    if (itsOnLibrary === true) {
      libraryButton = 
      <StyledLibraryButtonCheck onClick={() => onRemoveFromLibrary(video)}>
        <span>
          <MaterialIcon icon="check" color='#fff' />
          <MaterialIcon icon="close" color='#fff' />
        </span>
      </StyledLibraryButtonCheck>
    }
    else if (itsOnLibrary === false) {
      libraryButton = 
      <StyledLibraryButton onClick={() => onAddToLibrary(video, true)}>
        <MaterialIcon icon="add" color='#fff' />
      </StyledLibraryButton>
    }

  } else {
    libraryButton = 
    <StyledLibraryButton onClick={() => togglePlaylistPopup(video)}>
      <MaterialIcon icon="add" color='#fff' />
    </StyledLibraryButton>
  }

  if (user !== null) {
    if (inSearchResults === true || user.uid !== AuthorId || inRelatedVideos) {
      deleteButton = null
      if (inLibraryVideos && orderBy === "custom" && reorder) {
        libraryButton = <StyledDragHandle><MaterialIcon icon="drag_handle" color='#fff' /></StyledDragHandle>
      }
    } else {
      deleteButton = <StyledActionButton onClick={() => onRemoveFromPlaylist(videoId, playlist)}>
        <MaterialIcon icon="delete_forever" color='#fff' />
      </StyledActionButton>
      
      if (orderBy === "custom" && reorder) {
        libraryButton = <StyledDragHandle><MaterialIcon icon="drag_handle" color='#fff' /></StyledDragHandle>
      }
    }
  }


  return(
    <StyledVideoItem className={currentVideoId === videoId && 'active'}>
      {libraryButton}
      <StyledContent>
        {videoTrigger}
        <StyledActions>
          {addButton}
          {deleteButton}
        </StyledActions>
      </StyledContent>
    </StyledVideoItem>
  );
};

export default VideoItem;
