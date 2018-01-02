import React from 'react';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';

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
  padding-right: 20px;
  display: none;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  flex: 1 0 auto;
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

const PlayerControls = ({playPreviousVideo, playPreviousSearchVideo, togglePlay, playNextVideo, playNextSearchVideo, playerIsPlaying, playingFromSearch, video, videoTitle, videoChannel}) => {

  let button = null;
  let previousButton = null;
  let nextButton = null;

  if (playerIsPlaying === true) {
    button = <MaterialIcon icon="pause" color='#fff' />;
  } else {
    button = <MaterialIcon icon="play_arrow" color='#fff' />;
  }

  if (playingFromSearch === true) {
    previousButton = 
      <StyledButton onClick={() => playPreviousSearchVideo(video)}>
        <MaterialIcon icon="skip_previous" color='#fff' />
      </StyledButton>
    nextButton =
      <StyledButton onClick={() => playNextSearchVideo(video)}>
        <MaterialIcon icon="skip_next" color='#fff' />
      </StyledButton>
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

  return(
    <StyledPlayerContainer>
      <StyledSongInfo>
        {videoTitle &&
          <StyledSongInfoContainer>
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
        {/* <StyledButton><MaterialIcon icon="loop" color='#fff' /></StyledButton>
        <StyledButton><MaterialIcon icon="add" color='#fff' /></StyledButton> */}
      </StyledAditionalOptions>
    </StyledPlayerContainer>
  );
};


export default PlayerControls;