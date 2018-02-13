import React, { Component } from 'react';
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
  padding: 20px 20px 0;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;
const VideoListContainer = styled.ul`
  list-style: none;
  width: 100%;
  overflow-y: auto;
`;
const StyledHeader = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
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
const StyledOptionsPopup = styled.div`
  position: absolute;
  top: 40px;
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

    docRef.onSnapshot((doc) => {
      if (doc.exists) {
        this.setState({
          library: doc.data(),
          libraryOrderBy: doc.data().libraryOrderBy,
          libraryOrderDirection: doc.data().libraryOrderDirection
        })
      } else {
        this.setState({
          library: 'not found',
        })
        console.log("No such document!");
      }
    });    

    //Get videos inside library
    if (!this.state.library){
      return null;
    }
    let videosRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('library');
    videosRef = videosRef.orderBy(this.state.libraryOrderBy, this.state.libraryOrderDirection);

    videosRef.onSnapshot(querySnapshot => {
      const libraryVideos = [];
      querySnapshot.forEach(function (doc) {
        libraryVideos.push(doc.data());
      });
      this.setState({
        libraryVideos: libraryVideos,
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.library){
      return null;
    }
    //Get videos and reorder them if order changed.
    if (this.state.libraryOrderDirection !== prevState.libraryOrderDirection) {
      let videosRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('library');    

      videosRef = videosRef.orderBy(this.state.libraryOrderBy, this.state.libraryOrderDirection);

      videosRef.onSnapshot(querySnapshot => {
        const libraryVideos = [];
        querySnapshot.forEach(function (doc) {
          libraryVideos.push(doc.data());
        });
        this.setState({
          libraryVideos: libraryVideos,
        });
      });
    };

  };

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

  render() {    

    if (!this.state.library) {
      return null;
    }

    //Basic constants

    const library = this.state.library;

    //Map videos inside library
    const videoItems = this.state.libraryVideos.map((video) => { 
      
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
      const itsOnLibrary = this.props.libraryVideos.some((element) => {
        return element.videoID === video.videoID
      });

      return (
        <VideoItem
          user={this.props.user}
          playlist={this.state.library}
          playlistVideos={this.state.libraryVideos}
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
          onAddToLibrary={this.props.onAddToLibrary}
          onRemoveFromLibrary={this.props.onRemoveFromLibrary}
          itsOnLibrary={itsOnLibrary}
        />
      )
    });

    //Set Library options popup
    let libraryOptionsPopup = null;

    if (this.state.libraryOptionsIsOpen){
      if (this.props.user.uid) {
        
        libraryOptionsPopup = 

        <StyledOptionsPopup id="playlist-options-popup" tabIndex="0" onBlur={ () => this.toggleLibraryOptions() } >
          <StyledOptionsLabel>
            Order by <MaterialIcon icon="sort" color='#fff' />
          </StyledOptionsLabel>
          <StyledButtonPopup onClick={() => this.orderBy('timestamp')}>
            Recently Added
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('datePublished')}>
            Video Date
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('videoTitle')}>
            Video Title
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('videoChannel')}>
            Channel
          </StyledButtonPopup>
        </StyledOptionsPopup>

      }
    }

    return(
      <PlaylistContainer>
        <StyledHeader>
          {/* <StyledAuthorLink to={`/users/${playlist.AuthorId}`}>{playlistAuthor}'s</StyledAuthorLink> */}
          <StyledPlaylistName>Library</StyledPlaylistName>
          <StyledHeaderActions>
            <StyledPlaylistInfo>
              <StyledLabel>{library.libraryVideoCount} Videos in library</StyledLabel>
            </StyledPlaylistInfo>
            <StyledPlaylistActions>
              <StyledButton onClick={() => this.toggleLibraryOptions()}><MaterialIcon icon="more_vert" color='#fff' /></StyledButton>
              {libraryOptionsPopup}
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

export default Library;