import React, { Component } from 'react';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import orderBy from 'lodash/orderBy';

import VideoListContainer from './video_list_container';
import PlaylistOptionsPopup from './playlist_options_popup';

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
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
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
`;
const StyledPlaylistName = styled.h1`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  ${media.xmedium`
    padding-top: 0;
  `}
`;
const StyledLabel = styled.h3`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;
`;
const StyledPlaylistActions = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  position: relative;
  ${media.xmedium`
    margin-top: 0;
    justify-content: flex-end;
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
          library: doc.data(),
          libraryOrderBy: doc.data().libraryOrderBy,
          libraryOrderDirection: doc.data().libraryOrderDirection,
          libraryVideos: libraryVideos
        })
      } else {
        this.setState({
          library: 'not found',
        })
        console.log("No such document!");
      }
    });

    //Get videos inside library
    // if (!this.state.library){
    //   return null;
    // }
    // let videosRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('library');
    // videosRef = videosRef.orderBy(this.state.libraryOrderBy, this.state.libraryOrderDirection);

    // videosRef.onSnapshot(querySnapshot => {
    //   const libraryVideos = [];
    //   querySnapshot.forEach(function (doc) {
    //     libraryVideos.push(doc.data());
    //   });
    //   this.setState({
    //     libraryVideos: libraryVideos,
    //   });
    // });
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
      .then(function () {
        console.log("Library order updated Succesfully");
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });

    }

  }

  onSort = (items) => {
    let docRef = firebase.firestore().collection('users').doc(this.state.profileId);
    
    let newOrder = items.map(item => {
      return {
        timestamp: item.props.video.timestamp,
        videoEtag: item.props.video.videoEtag,
        videoID: item.props.video.videoID,
        videoTitle: item.props.video.videoTitle,
        videoChannel: item.props.video.videoChannel,
        datePublished: item.props.video.datePublished,
        duration: item.props.video.duration,
      }
    })

    if (this.state.libraryOrderDirection === 'desc') newOrder.reverse(); 

    docRef.update({
      libraryVideos: newOrder,
    })
    .then(() => console.log('Order updated'))
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
        <StyledHeaderContainer>
          <StyledHeader>
            {/* <StyledAuthorLink to={`/users/${playlist.AuthorId}`}>{playlistAuthor}'s</StyledAuthorLink> */}
            <StyledPlaylistName>Library</StyledPlaylistName>
            <StyledHeaderActions>
              <StyledPlaylistInfo>
                <StyledLabel>{library.libraryVideoCount} Videos in library</StyledLabel>
              </StyledPlaylistInfo>
              <StyledPlaylistActions>
                <StyledButton onClick={() => this.toggleLibraryOptions()}><MaterialIcon icon="more_vert" color='#fff' /></StyledButton>
              </StyledPlaylistActions>
            </StyledHeaderActions>
          </StyledHeader>
        </StyledHeaderContainer>
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

          // reorder={this.state.reorder}

        />
      </PlaylistContainer>
    )
  };
};

export default Library;