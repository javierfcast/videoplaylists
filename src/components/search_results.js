import React from 'react';
import styled from 'styled-components';

//custom components
import VideoItem from './video_item';

const VideoListContainer = styled.ul`
  list-style: none;
  padding: 20px;
  width: 100%;
`;

// const renderVideoItems = (items, togglePlayer) => {
//   if (items.lenght > 0) {

//   }
//   const videoItems = items.map((video) => {
//     return (
//       <VideoItem
//         key={video.etag}
//         video={video}
//         togglePlayer={togglePlayer}
//       />
//     )
//   });
//   return videoItems;
// }

const SearchResults = (props) => {

  if (props.searchResults.length === 0) {
    return null;
  }

  console.log(`Showing ${props.searchResults.length} results, try redefining your search to see more`);

  const videoItems = props.searchResults.map((video) => {
    return (
      <VideoItem 
        inSearchResults = {null}
        key = {video.etag} 
        video = {video}
        videoTitle={video.snippet.title}
        videoEtag={video.etag}
        videoId={video.id.videoId}
        videoChannel={video.snippet.channelTitle}
        togglePlayer = {props.togglePlayer}
        togglePlaylistPopup = {props.togglePlaylistPopup}
        onAddToPlaylist={props.onAddToPlaylist}
      />
    )
  });

  return(
    <VideoListContainer>
      <h1>Search Results:</h1>
      {videoItems}
    </VideoListContainer>
  );
}

export default SearchResults;
