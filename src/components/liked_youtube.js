import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import YTApi from './yt_api';
import _ from 'lodash';

import VideoListContainer from './video_list_container';
import PlaylistOptionsPopup from './playlist_options_popup';
import PlaylistHeader from './playlist_header';

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

//custom components

const PlaylistContainer = styled.div`
  padding: 20px 20px 0;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - 190px);
  display: flex;
  flex-direction: column;
  ${media.xmedium`
    height: calc(100vh - 100px);
  `}
`;
const StyledHeaderContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  position: relative;
`;
const StyledHeader = styled.div`
  display: block;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
  transition: all .5s ease-out;
  width: 100%;
  overflow: hidden;
  ${props => props.scrolling && `
    height: 60px;
  `}
`;
const StyledPlaylistName = styled.h1`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all .5s ease;
  ${props => props.scrolling && `
    font-size: 24px;
  `}
`;
const StyledAuthorLink = styled(Link)`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;  
  margin-bottom: 6px;
  color: #fff;
  text-decoration: none;
`;
const StyledHeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  transition: all .5s ease-out;
  ${media.xmedium`
    flex-direction: row;
  `}
  ${props => props.scrolling && `
    margin-top: -80px;
  `}
`;
const StyledPlaylistInfo = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  padding-top: 10px;
  justify-content: space-between;
  ${media.xmedium`
    padding-top: 0;
  `}
`;
const StyledLabel = styled.h3`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;
  transition: all .3s;
  ${props => props.scrolling && `
    opacity: 0;
    visibility: hidden;
  `}
`;
const StyledPopupContainer = styled.div`
  position: relative;
`;
const StyledButton = styled.a`
  opacity: .6;
  cursor: pointer;
  transition: all .3s ease;
  margin-left: 10px;
  display: block;
  &:hover{
    opacity: 1;
  }
  ${props => props.scrolling && `
    opacity: 0;
    visibility: hidden;
  `}
`;
const StyledLoginContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const StyledLogin = styled.a`
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1);
  display: block;
  padding: 10px 20px;
  text-align: center;
  transition: all .3s ease;
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;
class LikedYoutube extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profileId: this.props.match.params.profileId,
      playlist: {},
      playlistVideos: [],
      playlistOptionsIsOpen: false,
      orderBy: 'custom',
      orderDirection: 'desc',
      scrolling: false,

      nextPageToken: null,
      loading: false,
      allResults: false,
    };
  };

  componentWillMount() {
    if (this.props.gapiReady) {
      this.getYoutubeLikes()
    }
  }

  componentWillUpdate(nextProps, nextState) {
    
    if (nextProps.gapiReady && this.props.gapiReady !== nextProps.gapiReady) {
      this.getYoutubeLikes()
    }

    if (this.state.orderBy !== nextState.orderBy || this.state.orderDirection !== nextState.orderDirection) {
      this.setState({
        playlistVideos: _.orderBy(nextState.playlistVideos, [nextState.orderBy], [nextState.orderDirection])
      })
    }
  }

  getYoutubeLikes = () => {
    this.setState({
      loading: true
    }, () => {
      YTApi.videosGapi({part: 'snippet,contentDetails', myRating: 'like', maxResults: 50, pageToken: this.state.nextPageToken})
        .then(data => {
  
          const playlist = {
            Author: this.props.user.displayName,
            AuthorId: this.props.user.uid,
            createdOn: new Date(),
            featured: false,
            followers: 0,
            playlistId: data.etag,
            playlistName: 'Liked on YouTube',
            playlistSlugName: 'liked-on-youtube',
            videoCount: data.pageInfo.totalResults
          }
  
          let playlistVideos = _.map(data.items, video => ({
            timestamp: new Date(),
            videoEtag: video.etag,
            videoID: video.id,
            videoTitle: video.snippet.title,
            videoChannel: video.snippet.channelTitle,
            datePublished: video.snippet.publishedAt,
            duration: video.contentDetails.duration,
          }));
          
          this.setState({
            playlist,
            playlistVideos: [...this.state.playlistVideos, ...playlistVideos],
            orderBy: 'custom',
            orderDirection: 'desc',
            nextPageToken: data.nextPageToken,
            allResults: data.nextPageToken ? false : true,
            loading: false
          });
        })
        .catch(e => {
          console.log(e)
        });
    });
  }

  //Playlists Methods
  togglePlaylistsOptions = () => {
    this.setState({
      playlistOptionsIsOpen: !this.state.playlistOptionsIsOpen
    }, () => {
      if (document.getElementById("playlist-options-popup") !== null) {
        document.getElementById("playlist-options-popup").focus();
      }
    });
  };

  orderBy = (type) => {

    let orderDirection = this.state.orderDirection;

    if (orderDirection === 'asc'){
      orderDirection = 'desc'
    } else {
      orderDirection = 'asc'
    }

    this.setState({
      orderBy: type,
      orderDirection: orderDirection,
      playlistOptionsIsOpen: !this.state.playlistOptionsIsOpen
    })

  }

  onLoadMore = () => {
    if (!this.state.loading && !this.state.allResults) this.getYoutubeLikes()
  }

  render() {
    if (!this.props.user) {
      return null;
    }

    //Basic constants
    const playlist = this.state.playlist;

    return(
      <PlaylistContainer>
        <StyledHeaderContainer>
          {/* <StyledHeader scrolling={this.state.scrolling ? 1 : 0}>
            <StyledAuthorLink to={`/users/${this.props.user.uid}`}>{this.props.user.displayName}'s</StyledAuthorLink>
            <StyledPlaylistName scrolling={this.state.scrolling ? 1 : 0}>Liked on YouTube</StyledPlaylistName>
            <StyledHeaderActions scrolling={this.state.scrolling ? 1 : 0}>
              <StyledPlaylistInfo scrolling={this.state.scrolling ? 1 : 0}>
                <StyledLabel scrolling={this.state.scrolling ? 1 : 0}>
                  {this.state.playlist ? this.state.playlist.videoCount : 0} Videos in this playlist
                </StyledLabel>
                <StyledButton scrolling={this.state.scrolling ? 1 : 0} onClick={this.togglePlaylistsOptions}><MaterialIcon icon="more_vert" color='#fff' /></StyledButton>
              </StyledPlaylistInfo>
            </StyledHeaderActions>
          </StyledHeader> */}
          <PlaylistHeader 
            type="playlist"
            owner={this.props.user !== null && this.props.user.uid === playlist.AuthorId}
  
            playlist={playlist}
            playlistName={"Liked on YouTube"}
            togglePlaylistsOptions={this.togglePlaylistsOptions}
          />
        </StyledHeaderContainer>
        <StyledPopupContainer>
          <PlaylistOptionsPopup 
            open={this.state.playlistOptionsIsOpen && this.props.user && this.props.gapiReady}
            orderBy={this.state.orderBy}
            orderDirection={this.state.orderDirection}
            onOrderBy={this.orderBy}
            togglePlaylistsOptions={this.togglePlaylistsOptions}
            options={["date", "title", "channel"] }
          />
        </StyledPopupContainer>
        {
          this.props.gapiReady
        ?
          <VideoListContainer 
            playlistVideos={this.state.playlistVideos}
            user={this.props.user}
            playlist={this.state.playlist}
            libraryVideos={this.props.libraryVideos}
            currentVideoId = {this.props.videoId}
            origin="likedYoutube"
            togglePlayer={this.props.togglePlayer}
            togglePlaylistPopup={this.props.togglePlaylistPopup}
            onAddToPlaylist={this.props.onAddToPlaylist}
            onRemoveFromPlaylist={this.props.onRemoveFromPlaylist}
            onAddToLibrary={this.props.onAddToLibrary}
            onRemoveFromLibrary={this.props.onRemoveFromLibrary}
            orderBy={this.state.orderBy}
            setSnackbar={this.props.setSnackbar}

            loadMore={!this.state.allResults}
            onLoadMore={this.onLoadMore}
          />
        :
          <StyledLoginContainer>
            <StyledLogin onClick={() => this.props.onLogin('google')}>Login with Google</StyledLogin>
          </StyledLoginContainer>
        }
      </PlaylistContainer>
    )
  };
};

export default LikedYoutube;