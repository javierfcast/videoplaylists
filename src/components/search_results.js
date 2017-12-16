import React from 'react';
import styled from 'styled-components';
import { css } from 'styled-components';
//custom components
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

const SearchResultsContainer = styled.div`
  padding: 20px;
`
const SearchResultsTitle = styled.h1`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
`
const VideoListContainer = styled.ul`
  list-style: none;
  width: 100%;
  height: calc(100vh - 140px);
  overflow-y: auto;
  ${media.xmedium`
    height: calc(100vh - 218px);
  `}
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
        toggleSearchPlayer={props.toggleSearchPlayer}
        togglePlaylistPopup = {props.togglePlaylistPopup}
        onAddToPlaylist={props.onAddToPlaylist}
      />
    )
  });

  return(
    <SearchResultsContainer>
      <SearchResultsTitle>Search Results</SearchResultsTitle>
      <VideoListContainer>
        {videoItems}
      </VideoListContainer>
    </SearchResultsContainer>
  );
}

export default SearchResults;
