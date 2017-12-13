import React from 'react';
import styled from 'styled-components';

//custom components
import VideoItem from './video_item';

const VideoListContainer = styled.ul`
  list-style: none;
  padding: 20px;
  width: 100%;
  height: calc(100vh - 140px);
`;

const SearchResults = (props) => {

  if (props.searchResults.length === 0) {
    return null;
  }

  // console.log(`Showing ${props.searchResults.length} results, try redefining your search to see more`);

  const videoItems = props.searchResults.map((video) => {

    console.log(video);

    let date = new Date(video.snippet.publishedAt);
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
        currentVideoId={props.videoId}
        inSearchResults = {true}
        key = {video.etag} 
        video = {video}
        videoTitle={video.snippet.title}
        videoEtag={video.etag}
        videoId={video.id.videoId}
        videoChannel={video.snippet.channelTitle}
        datePublished={year + '-' + month + '-' + dt}
        togglePlayer = {props.togglePlayer}
        togglePlaylistPopup = {props.togglePlaylistPopup}
        onAddToPlaylist={props.onAddToPlaylist}
      />
    )
  });

  return(
    <VideoListContainer>
      <h1>Search Results</h1>
      {videoItems}
    </VideoListContainer>
  );
}

export default SearchResults;
