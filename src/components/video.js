import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import Moment from 'moment';

const sizes = {
  small: 360,
  xmedium: 720,
  xlarge: 1200,
  xxlarge: 1440
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

const StyledContainer = styled.div`
  padding: 20px 20px 0;
  width: 100%;
  overflow: auto;
  height: calc(100vh - 100px);
`;
const StyledCurrentVideo = styled.div`
  padding: 25vh 0;
  display: flex;
`;
const StyledVideoInfo = styled.div``;
const StyledNextVideoInfo = styled.div``;
const StyledNextVideo = styled.div`
  margin-bottom: 40px;
  display: flex;
`;
const StyledRelatedVideos = styled.div`
  margin-bottom: 40px;
`;

const StyledHeroTitle = styled.h1`
  font-size: 24px;
  margin: 10px 0;
  ${media.xmedium`
    font-size: 36px;
  `}
  ${media.xlarge`
    font-size: 48px;
  `}
  ${media.xxlarge`
    font-size: 60px;
  `}
`;
const StyledSectionTitle = styled.h2`
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  padding-bottom: 10px;
`;
const StyledLabel = styled.span`
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
`;
const StyledLibraryButton = styled.a``;
const StyledLibraryButtonCheck = styled.a`
  display: block;
  cursor: pointer;
  width: 24px;
  flex: 0 1 auto;
  margin-right: 12px;
  height: 24px;
  overflow: hidden;
  position: relative;
  span{
    transition: all .3s;
    position: absolute;
    top: 0;
  }
  &:hover{
    span:first-child{
      top: -26px;
    }
  }
`;
const StyledActions = styled.div`
  margin-top: 20px;
  display: flex;
`;
const StyledActionButton = styled.a`
  padding: 10px 10px 10px 0;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;


class Video extends Component {

  constructor(props) {
    super(props);

  };

  componentWillMount() {

  };

  componentDidMount() {

    const video = {
      videoID: this.props.match.params.videoId,
      videoTitle: 'Test',
      videoChannel: 'Channel Test'
    }
    
    this.props.toggleWatchPlayer(video);
  };

  componentWillUnmount() {
    
  }

  render() {    

    return (
      <StyledContainer>
        <StyledCurrentVideo>
          <StyledLibraryButtonCheck onClick={() => this.props.onRemoveFromLibrary(this.video)}>
            <span>
              <MaterialIcon icon="check" color='#fff' />
              <MaterialIcon icon="close" color='#fff' />
            </span>
          </StyledLibraryButtonCheck>
          <StyledVideoInfo>
            <StyledLabel>Channel of the video</StyledLabel>
            <StyledHeroTitle>Title of the video {this.props.match.params.videoId}</StyledHeroTitle>
            <StyledLabel>PUBLISHED: 2009-10-03 · DURATION: 03:18 </StyledLabel>
            <StyledActions>
              <StyledActionButton><MaterialIcon icon="playlist_add" color='#fff' /> Add to playlist</StyledActionButton>
              <StyledActionButton><MaterialIcon icon="share" color='#fff' /> Share</StyledActionButton>
            </StyledActions>
          </StyledVideoInfo>
        </StyledCurrentVideo>
        <StyledSectionTitle>Playing next</StyledSectionTitle>
        <StyledNextVideo>
          <StyledLibraryButtonCheck onClick={() => this.props.onRemoveFromLibrary(this.video)}>
            <span>
              <MaterialIcon icon="check" color='#fff' />
              <MaterialIcon icon="close" color='#fff' />
            </span>
          </StyledLibraryButtonCheck>
          <StyledNextVideoInfo>
            <StyledLabel>Channel of the video</StyledLabel>
            <h2>This is the title of the next video</h2>
            <StyledLabel>PUBLISHED: 2009-10-03 · DURATION: 03:18 </StyledLabel>
          </StyledNextVideoInfo>
        </StyledNextVideo>
        <StyledRelatedVideos>
          <StyledSectionTitle>Related videos</StyledSectionTitle>
          <p>Aquí va El listado de Video Items con unos 10 videos relacionados.</p>
        </StyledRelatedVideos>

      </StyledContainer>
    )
  }
}

export default Video;

