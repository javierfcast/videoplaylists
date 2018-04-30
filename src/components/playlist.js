import React, { Component } from 'react';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import {map, orderBy, some} from 'lodash';

import SharePopup from './share_popup';
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
const StyledNoFoundContent = styled.div`
  width: 100%;
  height: calc(100vh - 354px);
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
const StyledPopupContainer = styled.div`
  position: relative;
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
      relatedVideos: [],
      playlistOptionsIsOpen: false,
      orderBy: null,
      orderDirection: null,
      tags: [],
      customOrder: [],
      scrolling: false,
      reorder: false,

      tagItems: null,

      shareOpen: false,
    };
  };

  componentDidMount() {
    //Get Playlist document basic info
    let docRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId);

    this._unsubscribe = docRef.onSnapshot((doc) => {
      if (doc.exists) {

        let playlistVideos = doc.data().playlistVideos;

        //Copy old videos collection
        if (!playlistVideos) {
          let legacyVideosRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId).collection('videos');

          this._legacyUnsubscribe = legacyVideosRef.onSnapshot(querySnapshot => {
            playlistVideos = [];
            querySnapshot.forEach(function (doc) {
              playlistVideos.push(doc.data());
            });

            if (this.props.user && doc.data().AuthorId === this.props.user.uid) {
              docRef.update({
                playlistVideos,
                videoCount: playlistVideos.length
              });
            }

            this.setState({
              playlist: doc.data(),
              orderBy: doc.data().orderBy,
              orderDirection: doc.data().orderDirection,
              tags: doc.data().tags,
              playlistVideos:  doc.data().orderBy === 'custom'
              ? doc.data().orderDirection === 'asc' ? playlistVideos : playlistVideos.reverse() 
              : orderBy(playlistVideos, [doc.data().orderBy], [doc.data().orderDirection]),
            })

          });

          return
        }
        
        //Sort videos
        if (doc.data().orderBy === 'custom' && doc.data().orderDirection === 'desc') {
          playlistVideos = playlistVideos.reverse();
        }
        else if (doc.data().orderBy !== 'custom') {
          playlistVideos = orderBy(playlistVideos, [doc.data().orderBy], [doc.data().orderDirection])
        }

        this.setState({
          playlist: doc.data(),
          orderBy: doc.data().orderBy,
          orderDirection: doc.data().orderDirection,
          tags: doc.data().tags,
          playlistVideos: playlistVideos,
        })
      } 
      
      else {

        this.setState({
          playlist: 'not found',
          playlistPublicInfo: 'not found'
        })
        
      }
    });

    //Get playlist public Information (followers)
    let publicRef = firebase.firestore().collection('playlists').doc(this.state.playlistId);
    this._publicUnsuscribe = publicRef.onSnapshot((doc) => {
      if (doc.exists) {
        this.setState({
          playlistPublicInfo: doc.data(),
        });
      }
    });
  }

  componentWillUnmount() {
    this._unsubscribe()
    this._publicUnsuscribe()
    if (this._legacyUnsubscribe) this._legacyUnsubscribe()
  }

  componentWillUpdate(nextProps, nextState) {
    //Reorder videos if the current user doesn't owns the playlist
    if (this.state.orderBy !== nextState.orderBy || this.state.orderDirection !== nextState.orderDirection) {
      if (this.props.user && this.state.playlist && this.state.playlist.AuthorId !== this.props.user.uid) {
        this.setState({
          playlistVideos: orderBy(nextState.playlistVideos, [nextState.orderBy], [nextState.orderDirection])
        })
      }
    }
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

  toggleShare = () => {
    this.setState({
      shareOpen: !this.state.shareOpen
    }, () => {
      if (document.getElementById("share-popup") !== null) {
        document.getElementById("share-popup").focus();
      }
    });
  }

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

    if (this.props.user !== null && this.props.user.uid === this.state.profileId) {
      const playlistRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId);

      playlistRef.update({
        orderBy: type,
        orderDirection: orderDirection,
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });

    }
  }

  handleScroll = (event) => {
    if(event.currentTarget.scrollTop === 0 && this.state.scrolling === true){
      this.setState({
        scrolling: !this.state.scrolling
      })
    } else if (event.currentTarget.scrollTop !== 0 && this.state.scrolling !== true){
      this.setState({
        scrolling: !this.state.scrolling
      })
    }
  }

  onToggleReorder = () => {
    this.setState({reorder: !this.state.reorder})
  }

  onSort = (items) => {
    const docRef = firebase.firestore().collection("users").doc(this.state.profileId).collection("playlists").doc(this.state.playlistId);
    
    const newOrder = map(items, item => item.props.video);

    if (this.state.orderDirection === 'desc') newOrder.reverse(); 

    docRef.update({
      playlistVideos: newOrder,
    })
    .catch(function(error) {
      console.log(error)
      this.props.setSnackbar(error.message);
    });
  };

  render() {
    if (!this.state.playlist || !this.state.playlistPublicInfo) {
      return null;
    }

    if (this.state.playlist === 'not found'){
      return (
        <PlaylistContainer>
          <StyledNoFoundContent>
            <h1>The Playlist you are looking for no longer exists.</h1>
            { 
              some(this.props.followingPlaylists, {playlistId: this.state.playlistId}) 
              ? <PlaylistActions onClick={() => this.props.onPlaylistUnfollow(this.state.playlistId)}>
                  Unfollow
                </PlaylistActions> 
              : null
            }
          </StyledNoFoundContent>
        </PlaylistContainer>
      )
    }

    //Basic constants

    const playlist = this.state.playlist;
    const playlistName = this.state.playlist.playlistName;
    const playlistAuthor = this.state.playlist.Author;
    const playlistFollowers = this.state.playlistPublicInfo.followers;
    const playlistDescription = this.state.playlist.playlistDescription;
    const playlistHtml = this.state.playlist.playlistHtml;

    return(
      <PlaylistContainer>
        <PlaylistHeader
          type="playlist"
          owner={this.props.user !== null && this.props.user.uid === playlist.AuthorId}
          reorder={this.state.orderBy === "custom" ? this.state.reorder : null}
          scrolling={this.state.scrolling}
          back={true}
          share={true}

          playlist={playlist}
          playlistName={playlist.playlistName}
          playlistAuthor={playlistAuthor}
          playlistDescription={playlistDescription}
          playlistHtml={playlistHtml}
          playlistFollowers={playlistFollowers}
          onPlaylistFollow={this.props.onPlaylistFollow}
          togglePlaylistsOptions={this.togglePlaylistsOptions}
          toggleShare={this.toggleShare}
          onToggleReorder={this.onToggleReorder}
          followingPlaylists={this.props.followingPlaylists}
          
          tags={this.state.tags}
          onRemoveTag={this.props.onRemoveTag}
          toggleAddTagPopup={this.props.toggleAddTagPopup}
        />
        <StyledPopupContainer>
          <SharePopup
            open={this.state.shareOpen}
            name={playlistName}
            url={`https://videoplaylists.tv/users/${playlist.AuthorId}/${playlist.playlistId}`}
            onCopy={this.props.setSnackbar}
            onClose={this.toggleShare}
            id="share-popup"
          />
          <PlaylistOptionsPopup 
            open={this.state.playlistOptionsIsOpen && this.props.user !== null}
            playlist={this.state.playlist}
            orderBy={this.state.orderBy}
            orderDirection={this.state.orderDirection}
            
            onOrderBy={this.orderBy}
            onUpdatePlaylist={this.props.onUpdatePlaylist}
            onDeletePlaylist={this.props.onDeletePlaylist}
            
            togglePlaylistsOptions={this.togglePlaylistsOptions}
            toggleEditPlaylistPopup={this.props.toggleEditPlaylistPopup}

            editable={this.props.user && this.props.user.uid === this.state.playlist.AuthorId}
            updatePlaylist={this.state.playlist.spotifyUrl || this.state.playlist.youtubeUrl}
            options={
              this.props.user && this.props.user.uid === this.state.playlist.AuthorId 
              ? ["custom", "recent", "date", "title", "channel"] 
              : ["recent", "date", "title", "channel"]
            }
          />
        </StyledPopupContainer>
        <VideoListContainer 
          origin="playlist"
          playlistVideos={this.state.playlistVideos}
          user={this.props.user}
          playlist={this.state.playlist}
          libraryVideos={this.props.libraryVideos}
          currentVideoId = {this.props.videoId}
          related={this.props.user && this.props.user.uid === this.state.playlist.AuthorId}
          onSort={this.onSort}
          togglePlayer={this.props.togglePlayer}
          togglePlaylistPopup={this.props.togglePlaylistPopup}
          onAddToPlaylist={this.props.onAddToPlaylist}
          onRemoveFromPlaylist={this.props.onRemoveFromPlaylist}
          onAddToLibrary={this.props.onAddToLibrary}
          onRemoveFromLibrary={this.props.onRemoveFromLibrary}
          orderBy={this.state.orderBy}
          reorder={this.state.reorder}
          setSnackbar={this.props.setSnackbar}
          handleScroll={this.handleScroll}
          YT_API_KEY={this.props.YT_API_KEY}
        />
      </PlaylistContainer>
    )
  };
};

export default Playlist;