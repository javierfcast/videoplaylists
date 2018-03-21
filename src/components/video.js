import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';

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

const StyledContainer = styled.div`
  padding: 20px 20px 0;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;
const StyledContent = styled.div`
  list-style: none;
  width: calc(100% + 20px);
  margin-left: -10px;
  overflow-y: auto;
  padding: 20px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
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
        <StyledContent>
          <h1>Video Id: {this.props.match.params.videoId}</h1>
        </StyledContent>
      </StyledContainer>
    )
  }
}

export default Video;

