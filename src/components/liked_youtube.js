import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import VideoItem from './video_item';
import YTApi from './yt_api';
import _ from 'lodash';
import CircularProgress from 'material-ui/CircularProgress';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

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
const StyledOptionsPopup = styled.div`
  position: absolute;
  right: 0px;
  width: 220px;
  background: rgba(0,0,0,0.9);
  color: #fff;
  padding: 10px 0;
  z-index: 100;
  hr{
    background: none;
    border: none;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .material-icons{
    margin-left: 10px;
  }
  &:focus{
    outline: none;
  }
`;
const StyledOptionsLabel = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 2px;
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
const StyledButtonPopup = StyledButton.extend`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 2px;
`;
const VideoListContainer = styled.ul`
  list-style: none;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
`;
const StyledLoading = styled.div`
  margin: 40px 0;
  width: 100%;
  display: flex;
  justify-content: center;
  ${props => props.hide && `
    display: none;
  `}
`

class LikedYoutube extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profileId: this.props.match.params.profileId,
      playlist: null,
      playlistVideos: [],
      playlistOptionsIsOpen: false,
      orderBy: null,
      orderDirection: null,
      scrolling: false,

      videoItems: null,
      nextPageToken: null,
      loading: false,
    };
  };

  componentWillMount() {
    if (!this.props.user) return
    
    this.setState({
      playlist: {
        Author: this.props.user.displayName,
        AuthorId: this.props.user.uid,
        createdOn: new Date(),
        featured: false,
        followers: 0,
        playlistName: 'Liked on YouTube',
        playlistSlugName: 'liked-on-youtube',
        videoCount: 0
      }
    }, () => {
      if (this.props.gapiReady) {
        this.getYoutubeLikes()
      }
    });
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

    //Map videos inside playlist
    if (this.state.playlistVideos !== nextState.playlistVideos || this.props.libraryVideos !== nextProps.libraryVideos || this.state.reorder !== nextState.reorder) {

      const videoItems = nextState.playlistVideos.map((video) => {   
        let date = new Date(video.datePublished);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let dt = date.getDate();

        if (dt < 10) {
          dt = '0' + dt;
        }
        if (month < 10) {
          month = '0' + month;
        }

        //check if video it's in library
        const itsOnLibrary = nextProps.libraryVideos.some((element) => {
          return element.videoID === video.videoID
        });

        return (
          <VideoItem
            user={nextProps.user}
            playlist={nextState.playlist}
            playlistVideos={nextState.playlistVideos}
            currentVideoId = {nextProps.videoId}
            inSearchResults={false}
            key={video.videoEtag}
            video={video}
            videoEtag={video.videoEtag}
            videoTitle={video.videoTitle}
            videoId={video.videoID}
            videoChannel={video.videoChannel}
            duration={video.duration}
            datePublished={year + '-' + month + '-' + dt}
            togglePlayer={nextProps.togglePlayer}
            togglePlaylistPopup={nextProps.togglePlaylistPopup}
            onAddToPlaylist={nextProps.onAddToPlaylist}
            onRemoveFromPlaylist={nextProps.onRemoveFromPlaylist}
            onAddToLibrary={nextProps.onAddToLibrary}
            onRemoveFromLibrary={nextProps.onRemoveFromLibrary}
            orderBy={nextState.orderBy}
            itsOnLibrary={itsOnLibrary}
            reorder={nextState.reorder}
          />
        )
      })

      this.setState({videoItems});
    }
  }

  getYoutubeLikes = () => {
    this.setState({
      loading: true
    }, () => {
      YTApi.videos({part: 'snippet,contentDetails', myRating: 'like', maxResults: 50, pageToken: this.state.nextPageToken})
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
          }))
  
          playlistVideos = _.orderBy(playlistVideos, 'datePublished', 'desc')
  
          this.setState({
            playlist,
            playlistVideos: [...this.state.playlistVideos, ...playlistVideos],
            orderBy: 'datePublished',
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

  handleScroll = (event) => {
    // if(event.currentTarget.scrollTop === 0 && this.state.scrolling === true){
    //   this.setState({
    //     scrolling: !this.state.scrolling
    //   })
    // } else if (event.currentTarget.scrollTop !== 0 && this.state.scrolling !== true){
    //   this.setState({
    //     scrolling: !this.state.scrolling
    //   })
    // }

    if (event.currentTarget.scrollTop + (event.currentTarget.offsetHeight + 120) >= event.currentTarget.scrollHeight && !this.state.loading && !this.state.allResults) {
      this.getYoutubeLikes()
    }
  }

  render() {
    if (!this.state.playlist) {
      return null;
    }

    //Basic constants
    const playlist = this.state.playlist;
    const playlistAuthor = this.state.playlist.Author;

    //Set Playlist options popup
    let playlistOptionsPopup = null;
    const arrow = this.state.orderDirection === 'asc' ?  "arrow_downward" : "arrow_upward";

    if (this.state.playlistOptionsIsOpen){
      if (this.props.user) {
        
        playlistOptionsPopup = 

        <StyledOptionsPopup id="playlist-options-popup" tabIndex="0" onBlur={this.togglePlaylistsOptions} >
          <StyledOptionsLabel>
            Order by <MaterialIcon icon="sort" color='#fff' />
          </StyledOptionsLabel>
          <StyledButtonPopup onClick={() => this.orderBy('datePublished')}>
            Video Date
            <div style={{opacity: this.state.orderBy === 'datePublished' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('videoTitle')}>
            Video Title
            <div style={{opacity: this.state.orderBy === 'videoTitle' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('videoChannel')}>
            Channel
            <div style={{opacity: this.state.orderBy === 'videoChannel' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
          </StyledButtonPopup>
        </StyledOptionsPopup>
      }
    }

    return(
      <PlaylistContainer>
        <StyledHeaderContainer>
          <StyledHeader scrolling={this.state.scrolling ? 1 : 0}>
            <StyledAuthorLink to={`/users/${playlist.AuthorId}`}>{playlistAuthor}'s</StyledAuthorLink>
            <StyledPlaylistName scrolling={this.state.scrolling ? 1 : 0}>Liked on YouTube</StyledPlaylistName>
            <StyledHeaderActions scrolling={this.state.scrolling ? 1 : 0}>
              <StyledPlaylistInfo scrolling={this.state.scrolling ? 1 : 0}>
                <StyledLabel scrolling={this.state.scrolling ? 1 : 0}>{playlist.videoCount} Videos in this playlist</StyledLabel>
                <StyledButton scrolling={this.state.scrolling ? 1 : 0} onClick={this.togglePlaylistsOptions}><MaterialIcon icon="more_vert" color='#fff' /></StyledButton>
              </StyledPlaylistInfo>
            </StyledHeaderActions>
          </StyledHeader>
        </StyledHeaderContainer>
        <StyledPopupContainer>
          {playlistOptionsPopup}
        </StyledPopupContainer>
        <VideoListContainer onScroll={this.handleScroll}>
          {this.state.videoItems}
          <StyledLoading hide={this.state.allResults} >
            <MuiThemeProvider>
              <CircularProgress color="#fff" thickness={3} />
            </MuiThemeProvider>
          </StyledLoading>
        </VideoListContainer>
      </PlaylistContainer>
    )
  };
};

export default LikedYoutube;