import React, { Component } from 'react';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import {map, orderBy} from 'lodash';

import VideoListContainer from './video_list_container';
import PlaylistOptionsPopup from './playlist_options_popup';
import PlaylistHeader from './playlist_header';

//custom components

const PlaylistContainer = styled.div`
  padding: 20px 20px 0;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;
const StyledPopupContainer = styled.div`
  position: relative;
`;

class Library extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profileId: this.props.match.params.profileId,
      library: null,
      libraryVideos: [],
      libraryOptionsIsOpen: false,
      libraryOrderBy: null,
      libraryOrderDirection: null,

      reorder: false,
    };
  };

  componentDidMount() {
    
    //Get User document basic info
    let docRef = firebase.firestore().collection('users').doc(this.state.profileId);
    this._unsubscribe = docRef.onSnapshot((doc) => {
      if (doc.exists) {
        let libraryVideos = doc.data().libraryVideos;

        //Copy old collection videos
        if (!libraryVideos) {
          let legacyVideosRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('library');

          this._legacyUnsubscribe = legacyVideosRef.onSnapshot(querySnapshot => {
            libraryVideos = [];
            querySnapshot.forEach(function (doc) {
              libraryVideos.push(doc.data());
            });
            
            docRef.update({
              libraryVideos,
              libraryVideoCount: libraryVideos.length
            });
          });

          return
        }

        //Sort videos
        if (doc.data().libraryOrderBy === 'custom' && doc.data().libraryOrderDirection === 'desc') {
          libraryVideos = libraryVideos.reverse();
        }
        else if (doc.data().libraryOrderBy !== 'custom') {
          libraryVideos = orderBy(libraryVideos, [doc.data().libraryOrderBy], [doc.data().libraryOrderDirection])
        }

        this.setState({
          library: {...doc.data(), playlistName: 'Library'},
          libraryOrderBy: doc.data().libraryOrderBy,
          libraryOrderDirection: doc.data().libraryOrderDirection,
          libraryVideos: libraryVideos
        })
      } else {
        this.setState({
          library: 'not found',
        })
      }
    });
  }
  
  componentWillUnmount() {
      this._unsubscribe()
      if (this._legacyUnsuscribe) this._legacyUnsubscribe()
  }

  //Playlists Methods
  toggleLibraryOptions = () => {
    this.setState({
      libraryOptionsIsOpen: !this.state.libraryOptionsIsOpen
    }, () => {
      if (document.getElementById("playlist-options-popup") !== null) {
        document.getElementById("playlist-options-popup").focus();
      }
    });
  };

  orderBy = (type) => {

    let orderDirection = this.state.libraryOrderDirection;

    if (orderDirection === 'asc'){
      orderDirection = 'desc'
    } else {
      orderDirection = 'asc'
    }

    this.setState({
      libraryOrderBy: type,
      libraryOrderDirection: orderDirection,
      libraryOptionsIsOpen: !this.state.libraryOptionsIsOpen
    })

    if (this.props.user.uid === this.state.profileId) {
      const libraryRef = firebase.firestore().collection('users').doc(this.state.profileId);

      libraryRef.update({
        libraryOrderBy: type,
        libraryOrderDirection: orderDirection,
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });

    }

  }

  onToggleReorder = () => {
    this.setState({reorder: !this.state.reorder})
  }

  onSort = (items) => {
    let docRef = firebase.firestore().collection('users').doc(this.state.profileId);
    
    const newOrder = map(items, item => item.props.video);

    if (this.state.libraryOrderDirection === 'desc') newOrder.reverse(); 

    docRef.update({
      libraryVideos: newOrder,
    })
    .catch(function(error) {
      console.log(error)
    });
  };

  render() {    

    if (!this.state.library) {
      return null;
    }

    //Basic constants
    const library = this.state.library;

    return(
      <PlaylistContainer>
        <PlaylistHeader
          type="library"
          owner={this.props.user !== null && this.props.user.uid === library.uid}
          reorder={this.state.libraryOrderBy === "custom" ? this.state.reorder : null}

          playlist={library}
          playlistName={"Library"}
          togglePlaylistsOptions={this.toggleLibraryOptions}
          onToggleReorder={this.onToggleReorder}
        />
        <StyledPopupContainer>
          <PlaylistOptionsPopup 
            open={this.state.libraryOptionsIsOpen && this.props.user && this.props.user.uid}
            orderBy={this.state.libraryOrderBy}
            orderDirection={this.state.libraryOrderDirection}
            onOrderBy={this.orderBy}
            togglePlaylistsOptions={this.toggleLibraryOptions}
            options={["custom", "recent", "date", "title", "channel"] }
          />
        </StyledPopupContainer>
        <VideoListContainer 
          playlistVideos={this.state.libraryVideos}
          user={this.props.user}
          playlist={this.state.library}
          libraryVideos={this.state.libraryVideos}
          currentVideoId = {this.props.videoId}

          onSort={this.onSort}
          origin="library"

          togglePlayer={this.props.togglePlayer}
          togglePlaylistPopup={this.props.togglePlaylistPopup}
          onAddToPlaylist={this.props.onAddToPlaylist}
          onRemoveFromPlaylist={this.props.onRemoveFromPlaylist}
          onAddToLibrary={this.props.onAddToLibrary}
          onRemoveFromLibrary={this.props.onRemoveFromLibrary}
          orderBy={this.state.libraryOrderBy}
          setSnackbar={this.props.setSnackbar}

          reorder={this.state.reorder}
        />
      </PlaylistContainer>
    )
  };
};

export default Library;