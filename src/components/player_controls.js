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
    space-between;
  `}
`

const StyledSongInfo = styled.div`
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  ${media.xmedium`
    align-items: flex-start;
    text-align: left;
  `}
`
const StyledPlayerControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`
const StyledAditionalOptions = styled.div`
  padding-right: 20px;
  display: none;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  ${media.xmedium`
    display: flex;
  `}
`

const StyledButton = styled.a`
  cursor: pointer;
  padding: 0 10px;
  opacity: 0.6;
  transition: all .3s ease;
  &:hover{
    opacity: 1;
  }
`
const VideoTitle = styled.p`
  display: block;
  width: 100%;
`;

const Label = styled.span`
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
`;

const PlayerControls = ({playPreviousVideo, togglePlay, playNextVideo, playerIsPlaying, video, videoTitle, videoChannel, nextVideoId, previousVideoId}) => {

  let button = null;

  if (playerIsPlaying === true) {
    button = <MaterialIcon icon="pause" color='#fff' />;
  } else {
    button = <MaterialIcon icon="play_arrow" color='#fff' />;
  }

  return(
    <StyledPlayerContainer>
      <StyledSongInfo>
        {videoTitle &&
          <div>
            <VideoTitle>{videoTitle}</VideoTitle>
            <Label>{videoChannel}</Label>
          </div>
        }
      </StyledSongInfo>
      <StyledPlayerControls>
        <StyledButton onClick={() => playPreviousVideo(video)}>
          <MaterialIcon icon="skip_previous" color='#fff' />
        </StyledButton>
        <StyledButton onClick={() => videoTitle !== null && togglePlay()}>
          {button}
        </StyledButton>
        <StyledButton onClick={() => playNextVideo(video)}>
          <MaterialIcon icon="skip_next" color='#fff' />
        </StyledButton>
      </StyledPlayerControls>
      <StyledAditionalOptions>
        {/* <StyledButton><MaterialIcon icon="loop" color='#fff' /></StyledButton>
        <StyledButton><MaterialIcon icon="add" color='#fff' /></StyledButton> */}
      </StyledAditionalOptions>
    </StyledPlayerContainer>
  );
};


export default PlayerControls;