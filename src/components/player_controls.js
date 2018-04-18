import React from 'react';
import styled from 'styled-components';
import { css } from 'styled-components';
import { Link } from 'react-router-dom';
import MaterialIcon from 'material-icons-react';
import SeekSlider from 'react-video-seek-slider';

import logoYoutube from '../images/logo_youtube.svg';

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
const StyledControlsContainer = styled.div`
  width: 100%;
  height: 120px;
  position: relative;
  z-index: 900;
`;
const StyledSeekSliderContainer = styled.div`
  position: absolute;
  width: 100%;
  top: -10px;
`;
const StyledPlayerContainer = styled.div`
  height: 120px;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(255,255,255,0.1);
  justify-content: space-around;
  ${media.xmedium`
    height: 60px;
    flex-direction: row;
    justify-content: space-between;
  `}
`;
const StyledSongInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  flex: 1 0 auto;
  padding: 0 10px;
  ${media.xmedium`
    width: 33.3333%;
    padding: 0;
    padding-left: 20px;
    align-items: flex-start;
    text-align: left;
  `}
`;
const StyledSongInfoContainer = styled.div`
  width: 100%;
`;
const StyledPlayerControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1 0 auto;
  ${media.xmedium`
    width: 33.3333%;
  `}
`;
const StyledAditionalOptions = styled.div`
  padding-right: 16px;
  display: none;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  flex: 1 0 auto;
  position: relative;
  ${media.xmedium`
    display: flex;
    width: 33.3333%;
  `}
`;
const StyledButton = styled.a`
  cursor: pointer;
  padding: 0 10px;
  opacity: 0.6;
  transition: all .3s ease;
  &:hover{
    opacity: 1;
  }
`;
const VideoTitle = styled.p`
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Label = styled.span`
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
`;
const LabelLink = styled(Link)`
  text-decoration: none;
  color: #fff;
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
`;
const StyledYtLogo = styled.img`
  width: 110px;
  height: 26px;
  opacity: 0.4;
  transition: all .3s ease;
  &:hover{
    opacity: 1;
  }
`;
const StyledYtLink = styled.a`
  display: inline-block;
  width: 110px;
  height: 26px;
  margin-left: 10px;
`;

const PlayerControls = ({playPreviousVideo, playPreviousSearchVideo, togglePlay, playNextVideo, playNextSearchVideo, playerIsPlaying, playingFromSearch, playingFromLibrary, currentPlaylist, video, videoTitle, videoChannel, progressMax, progress, onProgressChange, togglePlaylistPopup, playingSource, toggleVideoOptions}) => {

  let button = null;
  let previousButton = null;
  let nextButton = null;
  let videoSource = null;
  let seekSlider = null;
  let addButton = null;
  let ytLink = null;

  const ytUrl = 
  video 
  ? "https://www.youtube.com/watch?v=" + video.videoID || video.id.videoId 
  : null;

  if (playerIsPlaying === true) {
    button = <MaterialIcon icon="pause" color='#fff' />;
  } else {
    button = <MaterialIcon icon="play_arrow" color='#fff' />;
  }

  if (currentPlaylist) {
    videoSource = <LabelLink to={playingSource}>{currentPlaylist.playlistName}</LabelLink>
    addButton = <StyledButton onClick={() => toggleVideoOptions()} ><MaterialIcon icon="more_horiz" color='#fff' /></StyledButton>
  }
  
  if (ytUrl) ytLink = <StyledYtLink href={ytUrl} target="_blank"><StyledYtLogo src={logoYoutube} alt='Logo YouTube' /></StyledYtLink>

  if (playingFromSearch === true) {
    previousButton = 
      <StyledButton onClick={() => playPreviousSearchVideo(video)}>
        <MaterialIcon icon="skip_previous" color='#fff' />
      </StyledButton>
    nextButton =
      <StyledButton onClick={() => playNextSearchVideo(video)}>
        <MaterialIcon icon="skip_next" color='#fff' />
      </StyledButton>
    videoSource = <Label>Search Results</Label>

  // } else if(playingFromLibrary === true) {
  //   videoSource = <Label>Browse</Label>

  } else {
    previousButton =
      <StyledButton onClick={() => playPreviousVideo(video)}>
        <MaterialIcon icon="skip_previous" color='#fff' />
      </StyledButton>
    nextButton =
      <StyledButton onClick={() => playNextVideo(video)}>
        <MaterialIcon icon="skip_next" color='#fff' />
      </StyledButton>
  } 

  if (progressMax > 0) {
    seekSlider = <SeekSlider
      max={progressMax}
      currentTime={progress}
      progress={0}
      onChange={(time)=> onProgressChange(time)}
      offset={0}
    />
  }

  return(
    <StyledControlsContainer>
      <StyledSeekSliderContainer>
      {seekSlider}
      </StyledSeekSliderContainer>
      <StyledPlayerContainer>
        <StyledSongInfo>
          {videoTitle &&
            <StyledSongInfoContainer>
              {videoSource}
              <VideoTitle>{videoTitle}</VideoTitle>
              <Label>{videoChannel}</Label>
            </StyledSongInfoContainer>
          }
        </StyledSongInfo>
        <StyledPlayerControls>
          {previousButton}
          <StyledButton onClick={() => videoTitle !== null && togglePlay()}>
            {button}
          </StyledButton>
          {nextButton}
        </StyledPlayerControls>
        <StyledAditionalOptions>
          {/* <StyledButton><MaterialIcon icon="loop" color='#fff' /></StyledButton> */}
          {addButton}
          {ytLink}
        </StyledAditionalOptions>
      </StyledPlayerContainer>
    </StyledControlsContainer>
  );
};


export default PlayerControls;