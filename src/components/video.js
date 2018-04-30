import React, { Component } from 'react';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import moment from 'moment';
import YTApi from './yt_api';
import {head, findIndex, remove, some, isEmpty, map, uniqBy} from 'lodash';
import axios from 'axios';
import CircularProgress from 'material-ui/CircularProgress';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import SpotifyWebApi from 'spotify-web-api-js';

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
  position: relative;
  padding: 20px 20px 0;
  width: 100%;
  overflow: auto;
  height: calc(100vh - 100px);
`;
const StyledArtistOnly = styled.div`
  position: absolute;
  right: 14px;
  top: 14px;
`;
const StyledLodingContainer = StyledContainer.extend`
  display: flex;
  align-items: center;
  justify-content: center;
`
const StyledNoFoundContent = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  h1{
    margin-bottom: 40px;
  }
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
const StyledSwitch = styled.label`
  padding: 10px 0;
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  input{
    display: none;
  }
  .switch-slider{
    cursor: pointer;
    width: 34px;
    height: 20px;
    background-color: rgba(255,255,255,0.2);
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 24px;
    position: relative;
    &:before{
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
      border-radius: 50%;
    }
  }
  .switch-label{
    transition: all .3s ease;
  	text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 2px;
    margin-right: 8px;
  }
  input:checked + .switch-slider {
    background-color: #71198E;
  }
  input:focus + .switch-slider {
    box-shadow: 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12), 0 2px 4px -1px rgba(0,0,0,.2);
  }
  input:checked + .switch-slider:before {
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
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

      notFound: false,
    }
  };

  componentWillMount() {
    if (!this.props.watchId || this.props.watchId !== this.props.match.params.videoId) {
      if (this.props.playerLoaded) {
        this.startRadio(this.props.match.params.videoId, this.props.match.params.spotifyId, this.props)
      }
    }
    else if (this.props.currentVideo && this.state.video.videoID !== this.props.currentVideo.videoID) {
      this.updateInfo(this.props.currentVideo, this.props.currentPlaylist)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.watchId || nextProps.watchId !== nextProps.match.params.videoId || this.props.topTracks !== nextProps.topTracks) {
      if (nextProps.playerLoaded) {
        this.startRadio(nextProps.match.params.videoId, nextProps.match.params.spotifyId, nextProps, this.props.topTracks !== nextProps.topTracks);
      }
    }

    else if (
      (nextProps.currentVideo && this.state.video.videoID !== nextProps.currentVideo.videoID) || 
      (nextProps.currentPlaylist && this.state.relatedVideos !== nextProps.currentPlaylist)
    ) {
      this.updateInfo(nextProps.currentVideo, nextProps.currentPlaylist)
    }
  };

  startRadio = (videoID, firstSpotifyId, props, isUpdate) => {
    if (this.state.loading) return

    let firstVideo;
    let watchArtist;

    this.setState({loading: true}, () => {
      const spotifyApi = new SpotifyWebApi();

      YTApi.videos({ part: 'snippet,contentDetails', key: this.props.YT_API_KEY, id: videoID })
      .then(response => {
        response = head(response) 

        if (!response) {this.setState({notFound: true}); throw new Error("Video not found.")}
  
        firstVideo = {
          timestamp: new Date(),
          videoEtag: response.etag,
          videoID: response.id,
          videoTitle: response.snippet.title,
          videoChannel: response.snippet.channelTitle,
          datePublished: response.snippet.publishedAt,
          duration: response.contentDetails.duration,
          spotifyId: firstSpotifyId || null
        }

        return firstVideo
      })
      .then(() => {
        const APPS_SCRIPT_TOKEN = "https://script.google.com/macros/s/AKfycbwxAkZ3StrS7tfLY1byXtKRCQF2k6PHVfjUNebnvfeEHq8CUdAR/exec";
        return axios.get(APPS_SCRIPT_TOKEN)
      })
      .then(token => {
        spotifyApi.setAccessToken(token.data.access_token);
        if (firstSpotifyId) {
          return new Promise ((resolve, reject) => {
            spotifyApi.getTrack(firstSpotifyId)
            .then(r => resolve(r))
            .catch(e => resolve(false))
          })
        }
        return false
      })
      .then(trackResponse => {
        if (!trackResponse) return spotifyApi.searchTracks(firstVideo.videoTitle)
        return trackResponse
      })
      .then(searchResponse => {
        if (!searchResponse) return false
        if (searchResponse.type === "track") {
          watchArtist = head(searchResponse.artists).name;
          if (props.topTracks) return spotifyApi.getArtistTopTracks(head(searchResponse.artists).id, "US")
          return spotifyApi.getRecommendations({seed_tracks: searchResponse.id, limit: 30})
        }
        
        if (isEmpty(searchResponse.tracks.items)) return false
        watchArtist = head(head(searchResponse.tracks.items).artists).name;

        if (props.topTracks) return spotifyApi.getArtistTopTracks(head(head(searchResponse.tracks.items).artists).id, "US")
        return spotifyApi.getRecommendations({seed_tracks: head(searchResponse.tracks.items).id, limit: 30})
      })
      .then(relatdTracks => {
        if (!relatdTracks) watchArtist = null;
        if (!relatdTracks || isEmpty(relatdTracks.tracks)) return false
        return map(relatdTracks.tracks, trackObj => (
          new Promise((resolve, reject) => {
            YTApi.search({
              part: "snippet",
              key: this.props.YT_API_KEY,
              q: trackObj.name + " " + head(trackObj.artists).name,
              type: "video",
              maxResults: 1
            })
            .then(res => {
              head(res).spotifyId = trackObj.id;
              resolve(res);
            })
            .catch(e => {
              reject(e);
            });
          })
        ))
      })
      .then(promises => {
        if (!promises) return false
        return Promise.all(promises)
      })
      .then(ytResults => {
        if (!ytResults || isEmpty(ytResults)) return false
        return map(ytResults, r => head(r))
      })
      .then(relatedResults => {
        if (relatedResults) return relatedResults
        return YTApi.search({ part: 'snippet', key: this.props.YT_API_KEY, relatedToVideoId: firstVideo.videoID, type: 'video', maxResults: 30 })
      })
      .then(relatedVideos => {
        relatedVideos = map(relatedVideos, relatedResult => ({
          datePublished: relatedResult.snippet.publishedAt,
          videoChannel: relatedResult.snippet.channelTitle,
          videoEtag: relatedResult.etag,
          videoID: relatedResult.id.videoId,
          videoTitle: relatedResult.snippet.title,
          key: relatedResult.id.videoId,
          duration: relatedResult.contentDetails.duration,
          spotifyId: relatedResult.spotifyId || null
        }))

        relatedVideos = uniqBy([firstVideo, ...relatedVideos], "videoID");

        const playlist = {
          Author: this.props.user ? this.props.user.displayName : "Anonymous",
          AuthorId: this.props.user ? this.props.user.uid : "Anonymous",
          createdOn: new Date(),
          featured: false,
          followers: 0,
          playlistId: firstVideo.videoEtag,
          playlistName: "radio",
          playlistSlugName: "radio",
          videoCount: relatedVideos.length,
        }

        this.props.togglePlayer(
          firstVideo, 
          playlist, 
          relatedVideos, 
          `/watch/${firstVideo.videoID}${firstVideo.spotifyId ? `/${firstVideo.spotifyId}` : ''}`, 
          videoID, 
          watchArtist, 
          isUpdate
        )

        this.setState({loading: false});
      })
      .catch(e => {
        console.log('error: ', e);
        this.props.setSnackbar(String(e))
      });
    });
  };

  updateInfo = (video, playlistVideos) => {
    video.durationFormated = moment.duration(video.duration).asMilliseconds() > 3600000
    ? moment.utc(moment.duration(video.duration).asMilliseconds()).format("hh:mm:ss")
    : moment.utc(moment.duration(video.duration).asMilliseconds()).format("mm:ss");

    video.datePublishedFormated = moment(video.publishedAt).format('YYYY[-]MM[-]DD');

    const playingNext = playlistVideos[findIndex(playlistVideos, {videoID: video.videoID}) + 1] || playlistVideos[0];

    playingNext.durationFormated = moment.duration(playingNext.duration).asMilliseconds() > 3600000
    ? moment.utc(moment.duration(playingNext.duration).asMilliseconds()).format("hh:mm:ss")
    : moment.utc(moment.duration(playingNext.duration).asMilliseconds()).format("mm:ss");

    playingNext.datePublishedFormated = moment(playingNext.publishedAt).format('YYYY[-]MM[-]DD');

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

    if (this.state.notFound) {
      return (
        <StyledContainer>
          <StyledNoFoundContent>
            <h1>Sorry. This video is not available.</h1>
          </StyledNoFoundContent>
        </StyledContainer>
      )
    }

    if (this.state.loading || !this.state.video.videoTitle) {
      return (
        <StyledLodingContainer>
          <MuiThemeProvider>
            <CircularProgress color="#fff" thickness={4} size={60} />
          </MuiThemeProvider>
        </StyledLodingContainer>
      )
    }

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
          url={`https://videoplaylists.tv/watch/${this.state.shareVideo.videoID}${this.state.shareVideo.spotifyId ? `/${this.state.shareVideo.spotifyId}` : ''}`}
          onCopy={this.props.setSnackbar}
          onClose={this.toggleShare}
          id="share-video-popup"
          large
        />
        {this.props.watchArtist && this.props.videoId === this.props.match.params.videoId
        ? <StyledArtistOnly>
            <StyledSwitch>
              <span className="switch-label">{this.props.watchArtist}'s top tracks</span>
              <input type="checkbox" onChange={this.props.toggleTopTracks} checked={this.props.topTracks} />
              <div className="switch-slider"></div>
            </StyledSwitch>
          </StyledArtistOnly>
        : null}
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
            playlist={this.state.playlist}
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

