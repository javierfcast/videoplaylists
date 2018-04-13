import React from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';
import Moment from 'moment';
import { Link } from 'react-router-dom';
import {SortableElement, SortableHandle} from 'react-sortable-hoc';

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
const StyledVideoInfoLink = styled(Link)`
  cursor: pointer;
  text-decoration: none;
  color: #fff;
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

const SortableItem = SortableElement(({ value }) => 
  value
);

const DragHandle = SortableHandle(() =>
  <StyledDragHandle><MaterialIcon icon="drag_handle" color='#fff' /></StyledDragHandle>
);

const VideoItem = ({ user, playlist, playlistVideos, video, videoTitle, videoEtag, videoId, videoChannel, datePublished, duration, togglePlayer, toggleSearchPlayer, togglePlaylistPopup, onAddToPlaylist, onRemoveFromPlaylist, origin, currentVideoId, orderBy, itsOnLibrary, onAddToLibrary, onRemoveFromLibrary, inLibraryVideos, reorder, toggleVideoOptions, index, onShare}) => {
  
  const durationFormated = Moment.duration(duration).asMilliseconds() > 3600000
    ? Moment.utc(Moment.duration(duration).asMilliseconds()).format("hh:mm:ss")
    : Moment.utc(Moment.duration(duration).asMilliseconds()).format("mm:ss")
  
  const AuthorId = typeof playlist !== 'undefined' ? playlist.AuthorId : null;
  const extraMeta = duration ? " · Duration: " + durationFormated : null; 
  
  let videoTrigger = null;
  
  if (origin === "radio") {
    videoTrigger = 
      <StyledVideoInfoLink to={`/watch/${videoId}`}>
        <VideoMeta>{videoChannel}</VideoMeta>
        <VideoItemTitle>{videoTitle}</VideoItemTitle>
        <VideoMeta>Published: {datePublished}{extraMeta}</VideoMeta>
      </StyledVideoInfoLink>
  } else if (origin === "search") {
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

  // Action buttons

  let quickActionButton = null;

  if (origin === "related") {
    //Auto add if user owns the playlist
    quickActionButton = 
    <StyledActionButton onClick={() => onAddToPlaylist(video, playlist, user.uid === AuthorId)}>
      <MaterialIcon icon="playlist_add" color='#fff' />
    </StyledActionButton>
  }
  
  else if (origin === "radio") {
    quickActionButton = 
    <StyledActionButton onClick={() => togglePlaylistPopup(video)}>
      <MaterialIcon icon="playlist_add" color='#fff' />
    </StyledActionButton>
  }

  let optionsButton = null;

  //With remove button
  if (origin === "playlist" || origin === "library") {
    //Remove button only if user owns the playlist
    optionsButton =
    <StyledActionButton onClick={() => toggleVideoOptions(video, user.uid === AuthorId)}> 
      <MaterialIcon icon="more_horiz" color='#fff' />
    </StyledActionButton>
  }

  else if (origin === "radio") {
    optionsButton =
    <StyledActionButton onClick={() => onShare(video)}>
      <MaterialIcon icon="share" color='#fff' />
    </StyledActionButton>
  }

  //No remove button
  else {
    optionsButton =
    <StyledActionButton onClick={() => toggleVideoOptions(video, false)}>
      <MaterialIcon icon="more_horiz" color='#fff' />
    </StyledActionButton>
  }

  //Add to library button or drag handdle
  let libraryButton = null;

  //User logged in
  if (user !== null) { 
    if (itsOnLibrary) {
      libraryButton = 
      <StyledLibraryButtonCheck onClick={() => onRemoveFromLibrary(video)}>
        <span>
          <MaterialIcon icon="check" color='#fff' />
          <MaterialIcon icon="close" color='#fff' />
        </span>
      </StyledLibraryButtonCheck>
    } 
    else {
      libraryButton = 
      <StyledLibraryButton onClick={() => onAddToLibrary(video, true)}>
        <MaterialIcon icon="add" color='#fff' />
      </StyledLibraryButton>
    }

    if (reorder) {
      libraryButton = <DragHandle />
    }
  }
  //Anonymous user
  else {
    libraryButton = 
    <StyledLibraryButton onClick={() => togglePlaylistPopup(video)}>
      <MaterialIcon icon="add" color='#fff' />
    </StyledLibraryButton>
  }

  //RETURN

  const videoItemElement = 
  <StyledVideoItem className={currentVideoId === videoId && 'active'}>
    {libraryButton}
    <StyledContent>
      {videoTrigger}
      <StyledActions>
        {quickActionButton}
        {optionsButton}
      </StyledActions>
    </StyledContent>
  </StyledVideoItem>

  if (reorder) return <SortableItem index={index} value={videoItemElement} />
  else return videoItemElement

};

export default VideoItem;
