import React from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';

const StyledPlayerContainer = styled.div`
  height: 60px;
  width: 100%;
  display: flex;
  border-top: 1px solid rgba(255,255,255,0.1);
  justify-content: space-between;
`

const StyledSongInfo = styled.div`
  padding-left: 20px;
  display: flex;
  height: 60px;
  flex-direction: column;
  justify-content: center;
  width: 100%;

`

const StyledPlayerControls = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

`
const StyledAditionalOptions = styled.div`
  padding-right: 10px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`

const StyledButton = styled.a`
  cursor: pointer;
  padding: 0 10px;
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

const PlayerControls = ({togglePlay, playerIsPlaying, videoTitle, videoChannel}) => {

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
        <StyledButton>
          <MaterialIcon icon="skip_previous" color='#fff' />
        </StyledButton>
        <StyledButton onClick={() => togglePlay()}>
          {button}
        </StyledButton>
        <StyledButton>
          <MaterialIcon icon="skip_next" color='#fff' />
        </StyledButton>
      </StyledPlayerControls>
      <StyledAditionalOptions>
        <StyledButton><MaterialIcon icon="loop" color='#fff' /></StyledButton>
        <StyledButton><MaterialIcon icon="add" color='#fff' /></StyledButton>
      </StyledAditionalOptions>
    </StyledPlayerContainer>
  );
};


export default PlayerControls;