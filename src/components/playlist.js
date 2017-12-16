import React from 'react';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import VideoItem from './video_item';

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

//custom components

const PlaylistContainer = styled.div`
  padding: 20px;
  width: 100%;
`;
const VideoListContainer = styled.ul`
  list-style: none;
  width: 100%;
  height: calc(100vh - 358px);
  overflow-y: auto;
  ${media.xmedium`
    height: calc(100vh - 258px);
  `}
`;
const StyledHeader = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 20px;
`;
const StyledHeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  ${media.xmedium`
    flex-direction: row;
  `}
`;
const StyledPlaylistInfo = styled.div`
  width: 100%;
`;
const StyledLabel = styled.h3`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;
`;
const StyledAuthor = StyledLabel.extend`
  margin-bottom: 6px;
`;
const StyledPlaylistActions = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  ${media.xmedium`
    margin-top: 0;
    justify-content: flex-end;
  `}
`
const StyledButton = styled.a`
  opacity: .6;
  cursor: pointer;
  transition: all .3s ease;
  margin-left: 20px;
  &:hover{
    opacity: 1;
  }
`;
const PlaylistActions = styled.a`
  position: relative;
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 10px;
  cursor: pointer;
  transition: all .3s ease;
  overflow: hidden;
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;
const PlaylistActionsNone = styled.span`
  position: relative;
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  padding: 10px;
  padding-left: 0;
  transition: all .3s ease;
  overflow: hidden;
`;

const Playlist = (props) => {

  if (!props.selectedPlaylist) {
    return null;
  }
  
  const videoItems = props.playlistVideos.map((video) => { 
    
    let date = new Date(video.datePublished);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dt = date.getDate();

    if (dt < 10) {
      dt = '0' + dt;
    }
    if (month < 10) {
      month = '0' + month;
    }
    
    return (
      <VideoItem
        user={props.user}
        currentVideoId = {props.videoId}
        inSearchResults={false}
        key={video.videoEtag}
        video={video}
        videoEtag={video.videoEtag}
        videoTitle={video.videoTitle}
        videoId={video.videoID}
        videoChannel={video.videoChannel}
        datePublished={year + '-' + month + '-' + dt}
        item={props.selectedPlaylist}
        togglePlayer={props.togglePlayer}
        togglePlaylistPopup={props.togglePlaylistPopup}
        onAddToPlaylist={props.onAddToPlaylist}
        onRemoveFromPlaylist={props.onRemoveFromPlaylist}
      />
    )
  });

  const item = props.selectedPlaylist;
  const itemPublic = props.selectedPlaylistPublicInfo;
  const batchSize = props.playlistVideos.length;

  let followButton = null;
  let actionsButton = null;

  if (props.user !== null ) {
    if (props.user.uid !== itemPublic.AuthorId) {

      followButton = <PlaylistActions onClick={() => props.onPlaylistFollow(item)}>
        {itemPublic.followers} Followers
      </PlaylistActions>

    } else {

      followButton = <PlaylistActionsNone>
        {itemPublic.followers} Followers
      </PlaylistActionsNone>
    }
    if (props.user.uid === props.selectedPlaylist.AuthorId ) {
      actionsButton = <div>
        <StyledButton onClick={() => props.toggleEditPlaylistPopup(item)}><MaterialIcon icon="edit" color='#fff' /></StyledButton>
        <StyledButton onClick={() => props.onDeletePlaylist(item, batchSize)}><MaterialIcon icon="delete_forever" color='#fff' /></StyledButton>
      </div>
    }
  } else {
    followButton = <PlaylistActionsNone>
      {itemPublic.followers} Followers
      </PlaylistActionsNone>
    
    actionsButton = null;
  }

  return(
    <PlaylistContainer>
      <StyledHeader>
        <h1>{props.currentPlaylistName}</h1>
        <StyledHeaderActions>
          <StyledPlaylistInfo>
            <StyledAuthor>{props.selectedPlaylist.Author}</StyledAuthor>
            <StyledLabel>{batchSize} Videos in this playlist</StyledLabel>
          </StyledPlaylistInfo>
          <StyledPlaylistActions>
            {followButton}
            {actionsButton}
          </StyledPlaylistActions>
        </StyledHeaderActions>
      </StyledHeader>
      <VideoListContainer>
        {videoItems}
      </VideoListContainer>
    </PlaylistContainer>
  )
};

export default Playlist;