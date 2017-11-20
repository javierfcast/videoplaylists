import _ from 'lodash';
import React, { Component } from 'react';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import YTSearch from 'youtube-api-search';
import YouTubePlayer from 'youtube-player';

//Import app components
import SearchBar from './components/search_bar';
import SearchResults from './components/search_results';
import Sidenav from './components/sidenav';
import PlayerControls from './components/player_controls';
//import Modal from './components/modal';
import VideoPlayer from './components/video_player';
import AddToPlaylistPopup from './components/add_to_playlist_popup.js';
import Playlist from './components/playlist';

//Import Reset CSS and Basic Styles for everything
import './style/reset.css';
import './style/style.css';

//Youtube Data 3 API Key
const YT_API_KEY = 'AIzaSyBCXlTwhpkFImoUbYBJproK1zSIMQ_9gLA';

const StyledContainer = styled.div`
  background: linear-gradient(45deg, rgba(175,1,198,0.65) 0%,rgba(68,70,181,0.73) 52%,rgba(74,0,114,0.8) 100%);
  transition: all, .5s ease;
  transition-delay: .5s;
  ${props => props.playerIsOpen && `
    opacity: 0;
  `}
  &:hover{
    opacity: 1;
    transition-delay: 0s;  
  }
`;
const StyledAside = styled.div`
  width: 240px;
  border-right: 1px solid rgba(255,255,255,0.1);
  position: fixed;
  top: 0;
  left: 0;
  height: calc(100vh - 60px);
  overflow-y: auto;
`;
const StyledMain = styled.div`
  width: calc(100% - 240px);
  left: 240px;
  position: relative;
  height: calc(100vh - 60px);
`;

const StyledListsContainer = styled.div`
  display: flex;
`;


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      user: null,
      myPlaylists: [],
      //Modal States
      modalIsOpen: false,
      //Player States
      playerIsOpen: false,
      playerIsPlaying: false,
      video: null,
      player: null,
      nextVideo: null,
      previousVideo: null,
      //Playlist Popup States
      playlistPopupIsOpen: false,
      videoToBeAdded: null,
      videoTitle:  null,
      videoEtag: null,
      videoId: null,
      videoChannel: null,
      //Playlist States
      selectedPlaylist: null,
      playlistVideos: [],
    }

    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);

  };

  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user })
      if (this.state.user){

        const docRef = firebase.firestore().collection('users').doc(this.state.user.uid).collection('playlists');
        const playlistQuery = docRef.where('playlistName', '>=', '');
  
        playlistQuery.onSnapshot(querySnapshot => {
          const myPlaylists = [];
          querySnapshot.forEach(function (doc) {
            myPlaylists.push(doc.data());
          });
          this.setState({ myPlaylists })
        });
      }
    });
  };

  componentDidMount(){
    const player = YouTubePlayer('video-player', {
      videoId: null,
      playerVars: {
        controls: 0,
        showinfo: 0,
        rel: 0,
      }
    });
    this.setState({ player }) 
  };

  componentWillUpdate(){

  };

  componentDidUpdate(){
  };

  onVideoSearch = (searchTerm) => {
    if (searchTerm === ''){
      this.setState({
        searchResults: []
      })
      return null;
    }
    YTSearch(
      { key: YT_API_KEY, term: searchTerm },
      (searchResults) => {
        this.setState({
          searchResults: searchResults
        })
      }
    );
  };

  onLogin = () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
    .then((result) => { 
      const user = result.user;
      this.setState({
        user: user
      });
      console.log(`${user.email} ha iniciado sesion`);
    })
    .catch((error) => {
      console.log(`Error ${error.code}: ${error.message}`)
    })
  };

  onLogout = () => {
    firebase.auth().signOut()
    .then((result) => { 
      this.setState({
        user: null
      });
      console.log(`Usuario ha salido`);
    })
    .catch((error) => {
      console.log(`Error ${error.code}: ${error.message}`)
    })
  };

  onPlaylistSelect = (item) => {
    console.log(`Selected: ${item.playlistName}`);
    //const docRef = firebase.firestore().doc(`users/${this.state.user.uid}/playlists/${item.playlistSlugName}/videos`);
    const docRef = firebase.firestore().collection('users').doc(this.state.user.uid).collection('playlists').doc(item.playlistSlugName).collection('videos');
    const playlistQuery = docRef.where('videoID', '>=', '');

    playlistQuery.onSnapshot(querySnapshot => {
      const playlistVideos = [];
      querySnapshot.forEach(function (doc) {
        playlistVideos.push(doc.data());
      });
      this.setState({ 
        playlistVideos: playlistVideos,
        selectedPlaylist: item,
      })
    });
  };

  toggleModal = () => {
    this.setState({
      modalIsOpen: !this.state.modalIsOpen
    });
  };

  togglePlayer = (video, nextVideo) => {

    // const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
    const videoId = typeof video.id !== 'undefined' ? video.id.videoId : video.videoID;
    const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
    const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;

    const nextVideoId = typeof nextVideo.id !== 'undefined' ? nextVideo.id.videoId : nextVideo.videoID;
    const nextVideoTitle = typeof nextVideo.snippet !== 'undefined' ? nextVideo.snippet.title : nextVideo.videoTitle;

    this.setState({
      playerIsOpen: true,
      video,
      videoTitle,
      videoChannel,
      playerIsPlaying: true,
    })

    const player = this.state.player;

    player.loadVideoById(videoId).then(function () {
      console.log(`${videoId} loaded.`);
    });
    
    player.playVideo().then(function () {
      console.log(`Starting to play ${videoTitle}.`);
    });

    player.on('stateChange', (event) => {
      if (event.data === 0) {
        player.loadVideoById(nextVideoId).then(function () {
          console.log(`${nextVideoId} loaded.`);
        });
        player.playVideo().then(function () {
          console.log(`Starting to play ${nextVideoTitle}.`);
        });
      }
    });
    
  };

  togglePlay = () => {
    if (this.state.playerIsPlaying === true)  {
      this.state.player.pauseVideo();  
    } else {
      this.state.player.playVideo();
    }
    this.setState({
      playerIsPlaying: !this.state.playerIsPlaying
    })
  };
  
  togglePlaylistPopup = (videoToBeAdded, videoTitle, videoEtag, videoId, videoChannel) => {
    this.setState({
      playlistPopupIsOpen: !this.state.playlistPopupIsOpen
    });
    this.setState({ videoToBeAdded, videoTitle, videoEtag, videoId, videoChannel })
  };

  onAddToPlaylist = (video, videoTitle, videoEtag, videoId, videoChannel, item) => {
    console.log(item.playlistSlugName);
    const user = this.state.user;
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${item.playlistSlugName}/videos/${videoId}`);
    docRef.set({
      videoEtag: videoEtag,
      videoID: videoId,
      videoTitle: videoTitle,
      videoChannel: videoChannel
    }, {
      merge: true
    }).then(function () {
      console.log(`${videoTitle} added to ${item.playlistName}`);

    }).catch(function (error) {
      console.log('Got an error:', error);
    })
    this.setState({
      playlistPopupIsOpen: !this.state.playlistPopupIsOpen
    });
  };

  onRemoveFromPlaylist = (videoId, item) => {
    console.log(`Removing: ${videoId} from ${item.playlistName}`)

    const user = this.state.user;
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${item.playlistSlugName}/videos/${videoId}`);
    
    docRef.delete().then(function () {
      console.log("Document successfully deleted!");
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  };

  onDeletePlaylist = (item, batchSize) => {
    const user = this.state.user;
    const db = firebase.firestore();
    const docRef = db.doc(`users/${user.uid}/playlists/${item.playlistSlugName}`);
    const collectionRef = db.collection('users').doc(user.uid).collection('playlists').doc(item.playlistSlugName).collection('videos');
    
    console.log(batchSize);
    console.log(this.state.selectedPlaylist);

    if (batchSize !== 0) {
      
      const query = collectionRef.orderBy('__name__').limit(batchSize);

      return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
        deletePlaylistDoc(docRef, item);
        this.setState({
          selectedPlaylist: null,
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        deletePlaylistDoc(docRef, item);
        this.setState({
          selectedPlaylist: null,
        });
      });
    }

    function deleteQueryBatch(db, query, batchSize, resolve, reject) {
      query.get()
        .then((snapshot) => {
          // When there are no documents left, we are done
          if (snapshot.size === 0) {
            return 0;
          }
  
          // Delete documents in a batch
          var batch = db.batch();
          snapshot.docs.forEach(function (doc) {
            batch.delete(doc.ref);
          });
  
          return batch.commit().then(function () {
            return snapshot.size;
          });
        }).then(function (numDeleted) {
          if (numDeleted <= batchSize) {
            resolve();
            return;
          }
  
          // Recurse on the next process tick, to avoid
          // exploding the stack.
          process.nextTick(function () {
            deleteQueryBatch(db, query, batchSize, resolve, reject);
          });
        })
        .catch(reject);
    }

    function deletePlaylistDoc(docRef, item) {
      docRef.delete().then(function () {
        console.log("Document successfully deleted!");
      }).catch(function (error) {
        console.error("Error removing document: ", error);
      });
    }

  };

  render() {

    const onVideoSearch = _.debounce((searchTerm) => { this.onVideoSearch(searchTerm) }, 300);

    return (
      <div>
        <StyledContainer playerIsOpen={this.state.playerIsOpen}>
          <StyledAside>
            <Sidenav
              onLogin={this.onLogin}
              onLogout={this.onLogout}
              user={this.state.user}
              myPlaylists={this.state.myPlaylists}
              onPlaylistSelect={this.onPlaylistSelect}
            />
          </StyledAside>
          <StyledMain>
            <SearchBar onVideoSearch={onVideoSearch}/>
            <StyledListsContainer>
              <SearchResults
                searchResults = {this.state.searchResults} 
                togglePlayer = {this.togglePlayer}
                togglePlaylistPopup = {this.togglePlaylistPopup}
              />
              <Playlist 
                selectedPlaylist={this.state.selectedPlaylist}
                playlistVideos={this.state.playlistVideos}
                togglePlayer={this.togglePlayer}
                togglePlaylistPopup={this.togglePlaylistPopup}
                onRemoveFromPlaylist={this.onRemoveFromPlaylist}
                onDeletePlaylist={this.onDeletePlaylist}
              />
            </StyledListsContainer>
          </StyledMain>
          <PlayerControls
            togglePlay={this.togglePlay}
            playerIsPlaying={this.state.playerIsPlaying}
            videoTitle={this.state.videoTitle}
            videoChannel={this.state.videoChannel}
          />
        </StyledContainer>
        <AddToPlaylistPopup 
          video={this.state.videoToBeAdded}
          videoTitle={this.state.videoTitle}
          videoEtag={this.state.videoEtag}
          videoId={this.state.videoId}
          videoChannel={this.state.videoChannel}
          open={this.state.playlistPopupIsOpen}
          onAddToPlaylist={this.onAddToPlaylist}
          onClose={this.togglePlaylistPopup}
          myPlaylists={this.state.myPlaylists}
        />
        <VideoPlayer
          video={this.state.video}
        />
        
      </div>
    )
  }
}

export default App;
