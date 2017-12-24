import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import VideoItem from './video_item';

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
  padding: 20px;
  width: 100%;
`;
const VideoListContainer = styled.ul`
  list-style: none;
  width: 100%;
  height: calc(100vh - 358px);
  overflow-y: auto;
  ${media.xmedium`
    height: calc(100vh - 258px);
  `}
`;
const StyledHeader = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
`;
const StyledNoFoundContent = styled.div`
  width: 100%;
  height: calc(100vh - 358px);
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  ${media.xmedium`
    height: calc(100vh - 258px);
  `}
  h1{
    margin-bottom: 40px;
  }
`;
const StyledHeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  ${media.xmedium`
    flex-direction: row;
  `}
`;
const StyledPlaylistInfo = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  padding-top: 10px;
`;
const StyledLabel = styled.h3`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;
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
const StyledPlaylistActions = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  ${media.xmedium`
    margin-top: 0;
    justify-content: flex-end;
  `}
`
const StyledButton = styled.a`
  opacity: .6;
  cursor: pointer;
  transition: all .3s ease;
  margin-left: 20px;
  &:hover{
    opacity: 1;
  }
`;
const PlaylistActions = styled.a`
  position: relative;
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 10px;
  cursor: pointer;
  transition: all .3s ease;
  overflow: hidden;
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;
const PlaylistActionsNone = styled.span`
  position: relative;
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  padding: 10px;
  padding-left: 0;
  transition: all .3s ease;
  overflow: hidden;
`;

class Playlist extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profileId: this.props.match.params.profileId,
      playlistId: this.props.match.params.playlistId,
      playlist: null,
      playlistPublicInfo: null,
      playlistVideos: [],
      //States that I think will need to be global.
      // playlistName: '',
      // currentPlaylistName: null,
      // playlistId: '',
      // playlistSlug: '',
    };
  };

  componentWillMount() {

    //Get Playlist document basic info
    let docRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId);

    docRef.onSnapshot((doc) => {
      if (doc.exists) {
        this.setState({
          playlist: doc.data(),
        })
      } else {
        this.setState({
          playlist: 'not found',
          playlistPublicInfo: 'not found'
        })
        console.log("No such document!");
      }
    });

    //Get playlist public Information (followers)
    let publicRef = firebase.firestore().collection('playlists').doc(this.state.playlistId);
    publicRef.onSnapshot((doc) => {
      if (doc.exists) {
        this.setState({
          playlistPublicInfo: doc.data(),
        });
      }
    }); 

    //Get videos inside playlist
    let videosRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId).collection('videos');
    videosRef = videosRef.orderBy("timestamp");

    videosRef.onSnapshot(querySnapshot => {
      const playlistVideos = [];
      querySnapshot.forEach(function (doc) {
        playlistVideos.push(doc.data());
      });
      this.setState({
        playlistVideos: playlistVideos,
      });
    });

  }

  render() {

    

    if (!this.state.playlist || !this.state.playlistPublicInfo) {
      return null;
    }

    if (this.state.playlist === 'not found'){
      
      const originFollowing = window.location.search.split('following=')[1];

      if (originFollowing === 'true'){
        return (
          <PlaylistContainer>
            <StyledNoFoundContent>
              <h1>The Playlist you are looking for no longer exists.</h1>
              <PlaylistActions onClick={() => this.props.onPlaylistUnfollow(this.state.playlistId)}>
                Unfollow
              </PlaylistActions>
            </StyledNoFoundContent>
          </PlaylistContainer>
        )
      } else {
        return (
          <PlaylistContainer>
            <StyledNoFoundContent>
              <h1>The Playlist you are looking for does not exists.</h1>
            </StyledNoFoundContent>
          </PlaylistContainer>
        )
      }
    }

    const playlist = this.state.playlist;
    const playlistName = this.state.playlist.playlistName;
    const playlistAuthor = this.state.playlist.Author;
    const playlistFollowers = this.state.playlistPublicInfo.followers;
    const batchSize = this.state.playlistVideos.length;
    
    const videoItems = this.state.playlistVideos.map((video) => { 
      
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
      
      return (
        <VideoItem
          user={this.props.user}
          playlist={this.state.playlist}
          playlistVideos={this.state.playlistVideos}
          currentVideoId = {this.props.videoId}
          inSearchResults={false}
          key={video.videoEtag}
          video={video}
          videoEtag={video.videoEtag}
          videoTitle={video.videoTitle}
          videoId={video.videoID}
          videoChannel={video.videoChannel}
          datePublished={year + '-' + month + '-' + dt}
          togglePlayer={this.props.togglePlayer}
          togglePlaylistPopup={this.props.togglePlaylistPopup}
          onAddToPlaylist={this.props.onAddToPlaylist}
          onRemoveFromPlaylist={this.props.onRemoveFromPlaylist}
        />
      )
    });

    let followButton = null;
    let actionsButton = null;

    if (this.props.user !== null ) {
      if (this.props.user.uid !== playlist.AuthorId) {

        followButton = <PlaylistActions onClick={() => this.props.onPlaylistFollow(playlist, playlistFollowers)}>
          {playlistFollowers} Followers
        </PlaylistActions>

      } else {

        followButton = <PlaylistActionsNone>
          {playlistFollowers} Followers
        </PlaylistActionsNone>
      }
      if (this.props.user.uid === playlist.AuthorId ) {
        actionsButton = <div>
          <StyledButton onClick={() => this.props.toggleEditPlaylistPopup(playlist)}><MaterialIcon icon="edit" color='#fff' /></StyledButton>
          <StyledButton onClick={() => this.props.onDeletePlaylist(playlist, batchSize)}><MaterialIcon icon="delete_forever" color='#fff' /></StyledButton>
        </div>
      }
    } else {
      followButton = <PlaylistActionsNone>
        {playlistFollowers} Followers
        </PlaylistActionsNone>
      
      actionsButton = null;
    }

    return(
      <PlaylistContainer>
        <StyledHeader>
          <StyledAuthorLink to={`/users/${playlist.AuthorId}`}>{playlistAuthor}'s</StyledAuthorLink>
          <h1>{playlistName}</h1>
          <StyledHeaderActions>
            <StyledPlaylistInfo>
              <StyledLabel>{batchSize} Videos in this playlist</StyledLabel>
            </StyledPlaylistInfo>
            <StyledPlaylistActions>
              {followButton}
              {actionsButton}
            </StyledPlaylistActions>
          </StyledHeaderActions>
        </StyledHeader>
        <VideoListContainer>
          {videoItems}
        </VideoListContainer>
      </PlaylistContainer>
    )
  };
};

export default Playlist;