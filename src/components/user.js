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

const StyledUserContainer = styled.div`
  padding: 20px 20px 0;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;
const StyledHeader = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 20px;
`;
const StyledUserName = styled.h1`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const StyledContent = styled.div`
  list-style: none;
  width: 100%;
  overflow-y: auto;
`;
const PlaylistItem = styled.li`
  padding: 20px 0;
  width: 100%;
  transition: all .3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover{
    background: linear-gradient(45deg, rgba(255,255,255,0) 0%,rgba(255,255,255,0.1) 100%);
  }
`;
const PlaylistLink = styled(Link)`
  cursor: pointer;
  color: #fff;
  text-decoration: none;
`;
const PlaylistTitle = styled.span`
  display: block;
  width: 100%;
  margin-bottom: 10px;
`;
const PlaylistAuthor = styled.span`
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
`;
const PlaylistActions = styled.a`
  position: relative;
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
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
  margin-right: 20px;
  padding: 10px;
  transition: all .3s ease;
  overflow: hidden;
`;

class User extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profile: null,
      profilePlaylists: [],
      publicPlaylists: []
    };
  };

  componentWillMount() {

    //Get User Info
    let profileRef = firebase.firestore().collection('users').doc(this.props.match.params.profileId);
    
    profileRef.get().then((doc) => {
      if (doc.exists) {
        this.setState({
          profile: doc.data(),
        })
      } else {
        console.log("No such document!");
        this.setState({
          profile: 'not found',
        })
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });

    //Browse Playlists Rutes
    let playlistsRef = firebase.firestore().collection('users').doc(this.props.match.params.profileId).collection('playlists');

    playlistsRef = playlistsRef.orderBy("createdOn", "desc");

    this._unsubscribe = playlistsRef.onSnapshot(querySnapshot => {
      const profilePlaylists = [];
      querySnapshot.forEach(function (doc) {
        profilePlaylists.push(doc.data());
      });
      this.setState({ profilePlaylists })
    });

    //Browse Public Playlists Rutes
    const publicPlaylistsRef = firebase.firestore().collection('playlists');

    this._publicUnsubscribe = publicPlaylistsRef.onSnapshot(querySnapshot => {
      const publicPlaylists = [];
      querySnapshot.forEach(function (doc) {
        publicPlaylists.push(doc.data());
      });
      this.setState({ publicPlaylists })
    });

  };

  componentWillUnmount() {
    this._unsubscribe();
    this._publicUnsubscribe();
  }

  render() {
    if (!this.state.profile) {
      return (
        <StyledUserContainer>
          <StyledHeader>
            <h1>Loading...</h1>
          </StyledHeader>
          <StyledContent>
            
          </StyledContent>
        </StyledUserContainer>
      )
    }

    if (this.state.profile === 'not found'){
      return (
        <StyledUserContainer>
          <StyledHeader>
            <h1>User not found</h1>
          </StyledHeader>
          <StyledContent>
            Browse or go to Recently Active Users to search for more.
        </StyledContent>
        </StyledUserContainer>
      )
    }

    const profile = this.state.profile;

    const playlistItem = this.state.profilePlaylists.map((playlist) => {

      let publicFollowers = 0;
      for (let i in this.state.publicPlaylists) {
        if (playlist.playlistId === this.state.publicPlaylists[i].playlistId) {
          publicFollowers = this.state.publicPlaylists[i].followers;
          break;
        }
      }

      const UserId = this.props.user !== null ? this.props.user.uid : null;
      let followButton = null;
      if (UserId !== playlist.AuthorId) {

        followButton = <PlaylistActions onClick={() => this.props.onPlaylistFollow(playlist)}>
          {publicFollowers} Followers
        </PlaylistActions>

      } else {

        followButton = <PlaylistActionsNone>
          {publicFollowers} Followers
        </PlaylistActionsNone>

      }

      return (
        <PlaylistItem key={playlist.playlistId}>
          <PlaylistLink to={`/users/${playlist.AuthorId}/${playlist.playlistId}`}>
            <PlaylistTitle>{playlist.playlistName}</PlaylistTitle>
            <PlaylistAuthor>{playlist.Author} | {playlist.videoCount} Videos</PlaylistAuthor>
          </PlaylistLink>
          {followButton}
        </PlaylistItem>
      )
    });

    return (
      <StyledUserContainer>
        <StyledHeader>
          <StyledUserName>{profile.displayName}</StyledUserName>
        </StyledHeader>
        <StyledContent>
          {playlistItem}
        </StyledContent>
      </StyledUserContainer>
    )
  }
}

export default User;

