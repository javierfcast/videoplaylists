import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import moment from 'moment';
import YTApi from './yt_api';
import head from 'lodash/head'

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
const StyledNextVideo = styled.div`
  margin-bottom: 40px;
  display: flex;
  padding: 20px 0;
  &:hover{
    background: linear-gradient(45deg, rgba(255,255,255,0) 0%,rgba(255,255,255,0.1) 100%);
  }
`;
const StyledNextVideoInfo = styled.div`
  width: 100%;
`;
const StyledNextVideoActions = styled.div`
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
  margin-bottom: 20px;
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
  margin-right: 10px;
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
    this.state = {
      video: {},
      playingNext: {},
      relatedVideos: []
    }
  };

  componentWillMount() {
    this.props.setOnWatch(true)

    if (this.props.playerLoaded) {
      //Shouldn't trigger if window reload
      this.getVideoInfo(this.props.match.params.videoId)
    }
    // if (this.props.playerLoaded) {
    //   this.getVideoInfo(this.props.match.params.videoId)
    //   this.getRelated(this.props.match.params.videoId)
    // }
  };

  componentDidMount() {

  };

  componentWillReceiveProps(nextProps) {

    // Should only trigger if window reload
    if (nextProps.playerLoaded && nextProps.playerLoaded !== this.props.playerLoaded && !this.state.video.videoID) {
      this.getVideoInfo(nextProps.match.params.videoId)
    }
    
    // Should trigger only when changing video and user is on the video view
    else if (this.props.match.params.videoId !== nextProps.match.params.videoId) {
      this.getVideoInfo(nextProps.match.params.videoId)
    }


    // else if (this.state.video.videoID !== nextProps.match.params.videoId) {
    //   this.getVideoInfo(nextProps.match.params.videoId, false)
    // }

    // if (this.state.video.videoID !== nextProps.match.params.videoId && nextProps.playerLoaded) {
    //   this.getVideoInfo(nextProps.match.params.videoId)
    //   this.getRelated(nextProps.match.params.videoId)
    // }
  }

  componentWillUpdate(nextProps, nextState) {
    // if (nextState.video && nextProps.playerLoaded) {
    //   if (!nextProps.currentVideoId) nextProps.toggleWatchPlayer(nextState.video)
    //   else if ( this.state.video.videoID !== this.props.match.params.videoId) nextProps.toggleWatchPlayer(nextState.video)

    // }
    // if video en state
    // if video !playing
    // if playerLoaded

    // set video

    

    // if (nextProps.playerLoaded && this.props.playerLoaded !== nextProps.playerLoaded) {
    //   const video = {
    //     videoID: this.props.match.params.videoId,
    //     videoTitle: 'Test',
    //     videoChannel: 'Channel Test'
    //   }

      

    //   // this.props.toggleWatchPlayer(video); //video, playlist, playlistvideos
    // } 
  }
  
  componentWillUnmount() {
    this.props.setOnWatch(false)
  }

  getVideoInfo = (videoID) => {
    YTApi.videos({ part: 'snippet,contentDetails', key: this.props.YT_API_KEY, id: videoID })
    .then(response => {
      response = head(response)

      const durationFormated = moment.duration(response.contentDetails.duration).asMilliseconds() > 3600000
      ? moment.utc(moment.duration(response.contentDetails.duration).asMilliseconds()).format("hh:mm:ss")
      : moment.utc(moment.duration(response.contentDetails.duration).asMilliseconds()).format("mm:ss")

      const video = {
        timestamp: new Date(),
        videoEtag: response.etag,
        videoID: response.id,
        videoTitle: response.snippet.title,
        videoChannel: response.snippet.channelTitle,
        datePublished: response.snippet.publishedAt,
        datePublishedFormated: moment(response.snippet.publishedAt).format('YYYY[-]MM[-]DD'),
        duration: response.contentDetails.duration,
        durationFormated,
      }

      this.setState({video}, () => this.getRelated(videoID));

    })
    .catch(e => {
      console.log('error: ', e);
    });
  }

  getRelated = (videoID) => {
    YTApi.search({ part: 'snippet', key: this.props.YT_API_KEY, relatedToVideoId: videoID, type: 'video', maxResults: 10 })
    .then((searchResults)=> {
      const relatedVideos = searchResults.map((result, index) => ({
          datePublished: result.snippet.publishedAt,
          datePublishedFormated: moment(result.snippet.publishedAt).format('YYYY[-]MM[-]DD'),
          videoChannel: result.snippet.channelTitle,
          videoEtag: result.etag,
          videoID: result.id.videoId,
          videoTitle: result.snippet.title,
          key: result.id.videoId,
          duration: result.contentDetails.duration,
          durationFormated: moment.duration(result.contentDetails.duration).asMilliseconds() > 3600000
          ? moment.utc(moment.duration(result.contentDetails.duration).asMilliseconds()).format("hh:mm:ss")
          : moment.utc(moment.duration(result.contentDetails.duration).asMilliseconds()).format("mm:ss")
      }));
      
      this.setState({
        playingNext: head(relatedVideos),
        relatedVideos: [this.state.video, ...relatedVideos]
      }, () => {
        this.props.toggleWatchPlayer(this.state.video, this.state.relatedVideos)
      });
      
    })
    .catch(e => {
      console.log('error: ', e);
    });
  };

  render() {    

    return (
      <StyledContainer>
        <StyledCurrentVideo>
          <StyledLibraryButtonCheck>
            <span>
              <MaterialIcon icon="check" color='#fff' />
              <MaterialIcon icon="close" color='#fff' />
            </span>
          </StyledLibraryButtonCheck>
          <StyledVideoInfo>
            <StyledLabel>{this.state.video.videoChannel}</StyledLabel>
            <StyledHeroTitle>"{this.state.video.videoTitle}"</StyledHeroTitle>
            <StyledLabel>{`PUBLISHED: ${this.state.video.datePublishedFormated} · DURATION: ${this.state.video.durationFormated}`} </StyledLabel>
            <StyledActions>
              <StyledActionButton><MaterialIcon icon="playlist_add" color='#fff' /> Add to playlist</StyledActionButton>
              <StyledActionButton><MaterialIcon icon="share" color='#fff' /> Share</StyledActionButton>
            </StyledActions>
          </StyledVideoInfo>
        </StyledCurrentVideo>
        <StyledSectionTitle>Playing next</StyledSectionTitle>
        <StyledNextVideo>
          <StyledLibraryButtonCheck>
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
          <StyledNextVideoActions>
            <StyledActionButton><MaterialIcon icon="playlist_add" color='#fff' /></StyledActionButton>
            <StyledActionButton><MaterialIcon icon="share" color='#fff' /></StyledActionButton>
          </StyledNextVideoActions>
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

