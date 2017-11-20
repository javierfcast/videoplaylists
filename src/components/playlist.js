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
const StyledButton = styled.a`
  opacity: .6;
  cursor: pointer;
  transition: all .3s ease;
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

    console.log(`playlist length ${props.playlistVideos.length}`);

    console.log(`Current video number: ${currentVideoNumber}`);

    const nextVideoNumber = currentVideoNumber !== props.playlistVideos.length - 1 ? currentVideoNumber + 1 : 0;

    const nextVideo = props.playlistVideos[nextVideoNumber];

    console.log(`Next video number: ${nextVideoNumber}`);

    return (
      <VideoItem
        inSearchResults={true}
        key={video.videoEtag}
        video={video}
        nextVideo={nextVideo}
        videoTitle={video.videoTitle}
        videoEtag={video.videoEtag}
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
          <h1>{props.selectedPlaylist.playlistName}</h1>
          <StyledLabel>{batchSize} Videos in this playlist</StyledLabel>
        </StyledPlaylistInfo>
        <StyledButton onClick={() => props.onDeletePlaylist(item, batchSize)}><MaterialIcon icon="delete_forever" color='#fff' /></StyledButton>
      </StyledHeader>
      {videoItems}
    </VideoListContainer>
  )
};

export default Playlist;