import React, { Component } from 'react';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import moment from 'moment';
import YTApi from './yt_api';
import {head, findIndex, remove, map, some} from 'lodash'

import VideoItem from './video_item';
import VideoListContainer from './video_list_container';
import SharePopup from './share_popup';

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
  cursor: pointer;
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
const StyledLibraryButton = styled.a`
  cursor: pointer;
  width: 24px;
  flex: 0 1 auto;
  margin-right: 12px;
`;
const StyledLibraryButtonCheck = styled.a`
  display: block;
  cursor: pointer;
  width: 24px;
  min-width: 24px;
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
  .material-icons{
    margin-right: 10px;
  }
`;

class Video extends Component {

  constructor(props) {
    super(props);
    this.state = {
      video: {},
      playingNext: {},
      relatedVideos: [],
      loading: false,

      shareOpen: false,
      shareVideo: {},
    }
  };

  componentWillMount() {
    if (!this.props.watchId || this.props.watchId !== this.props.match.params.videoId) {
      if (this.props.playerLoaded) {
        this.startRadio(this.props.match.params.videoId)
      }
    }
    else if (this.props.currentVideo && this.state.video.videoID !== this.props.currentVideo.videoID) {
      this.updateInfo(this.props.currentVideo, this.props.currentPlaylist)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.watchId || nextProps.watchId !== nextProps.match.params.videoId) {
      if (nextProps.playerLoaded) {
        this.startRadio(nextProps.match.params.videoId)
      }
    }

    else if (nextProps.currentVideo && this.state.video.videoID !== nextProps.currentVideo.videoID) {
      this.updateInfo(nextProps.currentVideo, nextProps.currentPlaylist)
    }
  };

  startRadio = (videoID) => {
    if (this.state.loading) return

    this.setState({loading: true}, () => {
      YTApi.videos({ part: 'snippet,contentDetails', key: this.props.YT_API_KEY, id: videoID })
      .then(response => {
        response = head(response)
  
        return {
          timestamp: new Date(),
          videoEtag: response.etag,
          videoID: response.id,
          videoTitle: response.snippet.title,
          videoChannel: response.snippet.channelTitle,
          datePublished: response.snippet.publishedAt,
          duration: response.contentDetails.duration,
        }
      })
      .then(video => {
        YTApi.search({ part: 'snippet', key: this.props.YT_API_KEY, relatedToVideoId: video.videoID, type: 'video', maxResults: 30 })
        .then((searchResults)=> {
          let relatedVideos = searchResults.map((result, index) => ({
              datePublished: result.snippet.publishedAt,
              videoChannel: result.snippet.channelTitle,
              videoEtag: result.etag,
              videoID: result.id.videoId,
              videoTitle: result.snippet.title,
              key: result.id.videoId,
              duration: result.contentDetails.duration,
          }));
  
          relatedVideos = [video, ...relatedVideos]
  
          this.props.toggleWatchPlayer(video, relatedVideos)

          this.setState({loading: false});
        })
        .catch(e => {
          this.props.setSnackbar(e)
          console.log('error: ', e);
        });
      })
      .catch(e => {
        this.props.setSnackbar(e)
        console.log('error: ', e);
      });
    });
  };

  updateInfo = (video, playlistVideos) => {
    video.durationFormated = moment.duration(video.duration).asMilliseconds() > 3600000
    ? moment.utc(moment.duration(video.duration).asMilliseconds()).format("hh:mm:ss")
    : moment.utc(moment.duration(video.duration).asMilliseconds()).format("mm:ss")

    video.datePublishedFormated = moment(video.publishedAt).format('YYYY[-]MM[-]DD')

    const playingNext = playlistVideos[findIndex(playlistVideos, {videoID: video.videoID}) + 1]

    playingNext.durationFormated = moment.duration(playingNext.duration).asMilliseconds() > 3600000
    ? moment.utc(moment.duration(playingNext.duration).asMilliseconds()).format("hh:mm:ss")
    : moment.utc(moment.duration(playingNext.duration).asMilliseconds()).format("mm:ss")

    playingNext.datePublishedFormated = moment(playingNext.publishedAt).format('YYYY[-]MM[-]DD')

    this.setState({video, playingNext}, () => this.getRelated(this.state.video.videoID));
  };

  getRelated = (videoID) => {
    YTApi.search({ part: 'snippet', key: this.props.YT_API_KEY, relatedToVideoId: videoID, type: 'video', maxResults: 10 })
    .then((searchResults)=> {
      let relatedVideos = searchResults.map((result, index) => ({
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

      relatedVideos = remove(relatedVideos, rv => rv.videoID !== this.state.playingNext.videoID)

      this.setState({relatedVideos})
      
    })
    .catch(e => {
      this.props.setSnackbar(e)
      console.log('error: ', e);
    });
  };

  toggleShare = (video) => {
    this.setState({
      shareOpen: !this.state.shareOpen,
      shareVideo: video ? video : {}
    });
  }

  render() {

    const currentLibraryButton =
    some(this.props.libraryVideos, e => (e.videoID === this.state.video.videoID))
    ? 
      <StyledLibraryButtonCheck onClick={() => this.props.onRemoveFromLibrary(this.state.video)}>
        <span>
          <MaterialIcon icon="check" color='#fff' />
          <MaterialIcon icon="close" color='#fff' />
        </span>
      </StyledLibraryButtonCheck>
    :
      <StyledLibraryButton onClick={() => this.props.onAddToLibrary(this.state.video, true)}>
        <MaterialIcon icon="add" color='#fff' />
      </StyledLibraryButton>

    const nextLibraryButton =
    some(this.props.libraryVideos, e => (e.videoID === this.state.playingNext.videoID))
    ? 
      <StyledLibraryButtonCheck onClick={() => this.props.onRemoveFromLibrary(this.state.playingNext)}>
        <span>
          <MaterialIcon icon="check" color='#fff' />
          <MaterialIcon icon="close" color='#fff' />
        </span>
      </StyledLibraryButtonCheck>
    :
      <StyledLibraryButton onClick={() => this.props.onAddToLibrary(this.state.playingNext, true)}>
        <MaterialIcon icon="add" color='#fff' />
      </StyledLibraryButton>

    return (
      <StyledContainer>
        <SharePopup
          open={this.state.shareOpen}
          name={this.state.shareVideo.videoTitle}
          url={`https://videoplaylists.tv/watch/${this.state.shareVideo.videoID}`}
          onCopy={this.props.setSnackbar}
          onClose={this.toggleShare}
          id="share-video-popup"
          large
        />
        <StyledCurrentVideo>
          {currentLibraryButton}
          <StyledVideoInfo>
            <StyledLabel>{this.state.video.videoChannel}</StyledLabel>
            <StyledHeroTitle>{this.state.video.videoTitle}</StyledHeroTitle>
            <StyledLabel>{`PUBLISHED: ${this.state.video.datePublishedFormated} · DURATION: ${this.state.video.durationFormated}`}</StyledLabel>
            <StyledActions>
              <StyledActionButton onClick={() => this.props.togglePlaylistPopup(this.state.video)} ><MaterialIcon icon="playlist_add" color='#fff' /> Add to playlist</StyledActionButton>
              <StyledActionButton onClick={() => this.toggleShare(this.state.video)} ><MaterialIcon icon="share" color='#fff' /> Share</StyledActionButton>
            </StyledActions>
          </StyledVideoInfo>
        </StyledCurrentVideo>
        <StyledSectionTitle>Playing next</StyledSectionTitle>
        <StyledNextVideo>
          {nextLibraryButton}
          <StyledNextVideoInfo onClick={this.props.playNextVideo}>
            <StyledLabel>{this.state.playingNext.videoChannel}</StyledLabel>
            <h2>{this.state.playingNext.videoTitle}</h2>
            <StyledLabel>{`PUBLISHED: ${this.state.playingNext.datePublishedFormated} · DURATION: ${this.state.playingNext.durationFormated}`}</StyledLabel>
          </StyledNextVideoInfo>
          <StyledNextVideoActions>
            <StyledActionButton onClick={() => this.props.togglePlaylistPopup(this.state.playingNext)} ><MaterialIcon icon="playlist_add" color='#fff' /></StyledActionButton>
            <StyledActionButton onClick={() => this.toggleShare(this.state.playingNext)} ><MaterialIcon icon="share" color='#fff' /></StyledActionButton>
          </StyledNextVideoActions>
        </StyledNextVideo>
        <StyledRelatedVideos>
          <StyledSectionTitle>Related videos</StyledSectionTitle>
          <VideoListContainer 
            playlistVideos={this.state.relatedVideos}
            user={this.props.user}
            libraryVideos={this.props.libraryVideos}
            currentVideoId = {this.props.videoId}
            origin="radio"
            togglePlayer={this.props.togglePlayer}
            togglePlaylistPopup={this.props.togglePlaylistPopup}
            onAddToPlaylist={this.props.onAddToPlaylist}
            onRemoveFromPlaylist={this.props.onRemoveFromPlaylist}
            onAddToLibrary={this.props.onAddToLibrary}
            onRemoveFromLibrary={this.props.onRemoveFromLibrary}
            setSnackbar={this.props.setSnackbar}
          />
        </StyledRelatedVideos>

      </StyledContainer>
    )
  }
}

export default Video;

