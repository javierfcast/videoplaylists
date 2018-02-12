import React from 'react';
import styled from 'styled-components';

const StyledVideoPlayer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  background: #000;
`;

const StyledIframe = styled.div`
  -moz-object-fit: cover;
  -webkit-object-fit: cover;
  object-fit: cover;
  width: 100%;
  height: 100%;
`;

const VideoPlayer = ({video}) => {

  // const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
  // const videoId = typeof video.id !== 'undefined' ? video.id.videoId : video.videoID;
  // const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
  // const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&rel=0&amp;showinfo=0`;

  return(
    <StyledVideoPlayer>
      <StyledIframe id="video-player"></StyledIframe>
    </StyledVideoPlayer>
  );

}

export default VideoPlayer;