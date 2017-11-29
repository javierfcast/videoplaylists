import React from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';

//custom components
import VideoItem from './video_item';

const VideoListContainer = styled.ul`
  list-style: none;
  padding: 20px;
  width: 100%;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  align-items: flex-end;
  padding-bottom: 20px;
  margin-bottom: 20px;
`;
const StyledPlaylistInfo = styled.div`
`;
const StyledLabel = styled.h3`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;
`;
const StyledPlaylistActions = styled.div``
const StyledButton = styled.a`
  opacity: .6;
  cursor: pointer;
  transition: all .3s ease;
  margin-left: 20px;
  &:hover{
    opacity: 1;
  }
`;


const Playlist = (props) => {

  if (!props.selectedPlaylist) {
    return null;
  }
  
  const videoItems = props.playlistVideos.map((video) => { 
    
    const currentVideoNumber = props.playlistVideos.indexOf(video);    
    

    //Set Next Video in the list.
    const nextVideoNumber = currentVideoNumber !== props.playlistVideos.length - 1 ? currentVideoNumber + 1 : 0;
    
    const nextVideo = props.playlistVideos[nextVideoNumber];
    const nextVideoId = typeof nextVideo.id !== 'undefined' ? nextVideo.id.videoId : nextVideo.videoID;
    const nextVideoTitle = typeof nextVideo.snippet !== 'undefined' ? nextVideo.snippet.title : nextVideo.videoTitle;
    const nextVideoChannel = typeof video.snippet !== 'undefined' ? nextVideo.snippet.channelTitle : nextVideo.videoChannel;

    video.nextVideo = nextVideo;
    video.nextVideoId = nextVideoId;
    video.nextVideoTitle = nextVideoTitle;
    video.nextVideoChannel = nextVideoChannel;

    //Set Previous Video in the list.
    const previousVideoNumber = currentVideoNumber !== 0 ? currentVideoNumber - 1 : props.playlistVideos.length - 1;
    
    const previousVideo = props.playlistVideos[previousVideoNumber];
    const previousVideoId = typeof previousVideo.id !== 'undefined' ? previousVideo.id.videoId : previousVideo.videoID;
    const previousVideoTitle = typeof previousVideo.snippet !== 'undefined' ? previousVideo.snippet.title : previousVideo.videoTitle;
    const previousVideoChannel = typeof video.snippet !== 'undefined' ? previousVideo.snippet.channelTitle : previousVideo.videoChannel;

    video.previousVideo = previousVideo;
    video.previousVideoId = previousVideoId;
    video.previousVideoTitle = previousVideoTitle;
    video.previousVideoChannel = previousVideoChannel;

    return (
      <VideoItem
        currentVideoId = {props.videoId}
        inSearchResults={true}
        key={video.videoEtag}
        video={video}
        videoEtag={video.videoEtag}
        videoTitle={video.videoTitle}
        videoId={video.videoID}
        videoChannel={video.videoChannel}
        item={props.selectedPlaylist}
        togglePlayer={props.togglePlayer}
        togglePlaylistPopup={props.togglePlaylistPopup}
        onAddToPlaylist={props.onAddToPlaylist}
        onRemoveFromPlaylist={props.onRemoveFromPlaylist}
      />
    )
  });

  const item = props.selectedPlaylist;
  const batchSize = props.playlistVideos.length;

  return(
    <VideoListContainer>
      <StyledHeader>
        <StyledPlaylistInfo>
          <h1>{props.currentPlaylistName}</h1>
          <StyledLabel>{batchSize} Videos in this playlist</StyledLabel>
        </StyledPlaylistInfo>
        <StyledPlaylistActions>
          <StyledButton onClick={() => props.toggleEditPlaylistPopup(item)}><MaterialIcon icon="edit" color='#fff' /></StyledButton>
          <StyledButton onClick={() => props.onDeletePlaylist(item, batchSize)}><MaterialIcon icon="delete_forever" color='#fff' /></StyledButton>
        </StyledPlaylistActions>
      </StyledHeader>
      {videoItems}
    </VideoListContainer>
  )
};

export default Playlist;