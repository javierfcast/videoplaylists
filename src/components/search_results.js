import React from 'react';
import styled from 'styled-components';

//custom components
import VideoItem from './video_item';

const SearchResultsContainer = styled.div`
  padding: 20px 20px 0;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;
const SearchResultsTitle = styled.h1`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
`;
const VideoListContainer = styled.ul`
  list-style: none;
  width: 100%;
  overflow-y: auto;
`;

const SearchResults = (props) => {

  if (props.searchResults.length === 0) {
    return null;
  }

  // console.log(`Showing ${props.searchResults.length} results, try redefining your search to see more`);

  const videoItems = props.searchResults.map((video) => {

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

    //check if video it's in library
    const itsOnLibrary = props.libraryVideos.some((element) => {
      return element.videoID === video.id.videoId
    });

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
        duration={video.contentDetails ? video.contentDetails.duration : null}
        datePublished={year + '-' + month + '-' + dt}
        togglePlayer = {props.togglePlayer}
        toggleSearchPlayer={props.toggleSearchPlayer}
        togglePlaylistPopup = {props.togglePlaylistPopup}
        onAddToPlaylist={props.onAddToPlaylist}
        onAddToLibrary={props.onAddToLibrary}
        onRemoveFromLibrary={props.onRemoveFromLibrary}
        itsOnLibrary={itsOnLibrary}
        fromWatch={/watch.*/.test(props.history.location.pathname)}
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
