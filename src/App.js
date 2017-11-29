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
import EditPlaylistPopup from './components/edit_playlist_popup.js';
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
  height: 100vh;
  overflow: hidden;
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
  overflow: auto;
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
      player: null,
      //Previous Video States
      previousVideo: null,
      previousVideoId: null,
      previousVideoTitle: null,
      previousVideoChannel: null,
      //current Video States
      video: null,
      videoEtag: null,
      videoId: null,
      videoTitle:  null,
      videoChannel: null,
      //nextVideo States
      nextVideo: null,
      nextVideoId: null,
      nextVideoTitle: null,
      nextVideoChannel: null,
      //Edit Playlist Popup
      editPlaylistPopupIsOpen: false,
      addingNewPlaylist: false,
      previousPlaylistName: '',
      previousPlaylistSlug: '',
      playlistId: '',
      playlistName: '',
      playlistSlug: '',
      //Playlist Popup States
      playlistPopupIsOpen: false,
      videoToBeAdded: null,
      //Playlist States
      selectedPlaylist: null,
      currentPlaylistName: null,
      playlistVideos: [],
    }

    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);

  };

  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user })
      if (this.state.user){

        //Load Playlists
        let docRef = firebase.firestore().collection('users').doc(this.state.user.uid).collection('playlists');

        docRef = docRef.orderBy("createdOn", "desc");

        docRef.onSnapshot(querySnapshot => {
          const myPlaylists = [];
          querySnapshot.forEach(function (doc) {
            myPlaylists.push(doc.data());
          });
          this.setState({ myPlaylists })
        });
      };
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

  componentDidUpdate(prevProps, prevState){
    // if (!this.state.videoId) {
    //   return null;
    // }

    if(this.state.videoId !== prevState.videoId){
      this.state.player.loadVideoById(this.state.videoId);
    }

    if (document.getElementById("input-playlist-popup") !== null) {
      document.getElementById("input-playlist-popup").focus();
    }

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
    let docRef = firebase.firestore().collection('users').doc(this.state.user.uid).collection('playlists').doc(item.playlistId).collection('videos');
    docRef = docRef.orderBy("timestamp");

    docRef.onSnapshot(querySnapshot => {
      const playlistVideos = [];
      querySnapshot.forEach(function (doc) {
        playlistVideos.push(doc.data());
      });
      this.setState({
        playlistVideos: playlistVideos,
        selectedPlaylist: item,
        currentPlaylistName: item.playlistName,
        playlistId: item.playlistId,
        playlistName: item.playlistName,
        playlistSlug: item.playlistSlugName
      });
    });
    
    // const playlistQuery = docRef.where('videoID', '>=', '');
    // playlistQuery.onSnapshot(querySnapshot => {
    //   const playlistVideos = [];
    //   querySnapshot.forEach(function (doc) {
    //     playlistVideos.push(doc.data());
    //   });
    //   this.setState({ 
    //     playlistVideos: playlistVideos,
    //     selectedPlaylist: item,
    //   })
    // });

  };

  togglePlayer = (video) => {

    // const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
    const videoId = typeof video.id !== 'undefined' ? video.id.videoId : video.videoID;
    const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
    const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;    

    this.setState({
      playerIsOpen: true,
      playerIsPlaying: true,
      video,
      videoId,
      videoTitle,
      videoChannel,
    });

    console.log(`[togglePlayer] Currently Playing: ${videoTitle}`);

    const player = this.state.player;

    if (typeof video.nextVideo !== 'undefined') {
      const nextVideo = video.nextVideo;
      const nextVideoId = video.nextVideoId;
      const nextVideoTitle = video.nextVideoTitle;
      const nextVideoChannel = video.nextVideoChannel;

      const previousVideo = video.previousVideo;
      const previousVideoId = video.previousVideoId;
      const previousVideoTitle = video.previousVideoTitle;
      const previousVideoChannel = video.previousVideoChannel;

      this.setState({
        nextVideo,
        nextVideoId,
        nextVideoTitle,
        nextVideoChannel,
        previousVideo,
        previousVideoId,
        previousVideoTitle,
        previousVideoChannel,
      })

      console.log(`[togglePlayer] Coming Up Next: ${nextVideoTitle}`);

      player.on('stateChange', (event) => {

        if (event.data === 0) {

          this.setState({
            video: this.state.nextVideo,
            videoId: this.state.nextVideoId,
            videoTitle: this.state.nextVideoTitle,
            videoChannel: this.state.nextVideoChannel,
          })

          this.setState(prevState => ({
            nextVideo: prevState.video.nextVideo,
            nextVideoId: prevState.video.nextVideoId,
            nextVideoTitle: prevState.video.nextVideoTitle,
            nextVideoChannel: prevState.video.nextVideoChannel,
          }));

          console.log(`[Event Listener] Currently Playing: ${this.state.videoTitle}`)
          console.log(`[Event Listener] Comming Up Next: ${this.state.nextVideoTitle}`)

        };

      });

    } else {
      player.on('stateChange', (event) => {
        if (event.data === 0) {
          this.setState({
            playerIsPlaying: !this.state.playerIsPlaying
          })
        };
      });
    }
    
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

  playNextVideo = () => {

    this.setState(prevState => ({
      previousVideo: this.state.Video,
      previousVideoId: this.state.VideoId,
      previousVideoTitle: this.state.VideoTitle,
      previousVideoChannel: this.state.VideoChannel,
      nextVideo: this.state.nextVideo,
      nextVideoId: this.state.nextVideoId,
      nextVideoTitle: this.state.nextVideoTitle,
      nextVideoChannel: this.state.nextVideoChannel,
    }));

    this.setState(prevState => ({
      video: prevState.video.nextVideo,
      videoId: prevState.video.nextVideoId,
      videoTitle: prevState.video.nextVideoTitle,
      videoChannel: prevState.video.nextVideoChannel,
    }));

    console.log(`[Play Next] Currently Playing: ${this.state.videoTitle}`)
    console.log(`[Play Next] Comming Up Next: ${this.state.nextVideoTitle}`)

  };

  playPreviousVideo = () => {
    this.setState({
      previousVideo: this.state.previousVideo,
      previousVideoId: this.state.previousVideoId,
      previousVideoTitle: this.state.previousVideoTitle,
      previousVideoChannel: this.state.previousVideoChannel,
      nextVideo: this.state.Video,
      nextVideoId: this.state.VideoId,
      nextVideoTitle: this.state.VideoTitle,
      nextVideoChannel: this.state.VideoChannel,
    })

    this.setState(prevState => ({
      video: prevState.video.previousVideo,
      videoId: prevState.video.previousVideoId,
      videoTitle: prevState.video.previousVideoTitle,
      videoChannel: prevState.video.previousVideoChannel,
    }));

    console.log(`[Play Previous] Currently Playing: ${this.state.videoTitle}`)
    console.log(`[Play Previous] Comming Up Next: ${this.state.nextVideoTitle}`)

  };
  
  toggleClosePlaylistPopup = () => {
    this.setState({
      editPlaylistPopupIsOpen: !this.state.editPlaylistPopupIsOpen
    });
  };

  togglePlaylistPopup = (videoToBeAdded) => {
    this.setState({
      playlistPopupIsOpen: !this.state.playlistPopupIsOpen
    });
    this.setState({ videoToBeAdded })
  };

  onAddToPlaylist = (video, item) => {
    console.log(item.playlistSlugName);
    console.log(item);
    const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
    const videoId = typeof video.id !== 'undefined' ? video.id.videoId : video.videoID;
    const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
    const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;    

    const user = this.state.user;
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${item.playlistId}/videos/${videoId}`);
    docRef.set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      videoEtag: videoEtag,
      videoID: videoId,
      videoTitle: videoTitle,
      videoChannel: videoChannel,
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
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${item.playlistId}/videos/${videoId}`);
    
    docRef.delete().then(function () {
      console.log("Document successfully deleted!");
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  };

  slugify = (text) => {
    return text.toString().toLowerCase()
      // eslint-disable-next-line 
      .replace(/\s+/g, '-')           // Replace spaces with -
      // eslint-disable-next-line 
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      // eslint-disable-next-line 
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  onEditPlaylistInputChange = (event) => {
    this.setState({
      playlistName: event.target.value,
      playlistSlug: this.slugify(event.target.value)
    });
  }

  toggleAddPlaylistPopup = () => {
    this.setState({
      addingNewPlaylist: true,
      previousPlaylistName: '',
      previousPlaylistSlug: '',
      playlistName: '',
      playlistSlug: '',
      editPlaylistPopupIsOpen: !this.state.editPlaylistPopupIsOpen
    });
  };

  onAddPlaylist = () => {
    const user = this.state.user;
    console.log(`User id: ${user.uid}`);
    console.log(`playlist name: ${this.state.playlistName}`);
    console.log(`playlist slug: ${this.state.playlistSlug}`);
    const docRef = firebase.firestore().collection('users').doc(user.uid).collection('playlists');
    // const docRef = firebase.firestore().doc(`users/${user.uid}/playlists`);
    docRef.add({
      createdOn: firebase.firestore.FieldValue.serverTimestamp(),
      playlistName: this.state.playlistName,
      playlistSlugName: this.state.playlistSlug,
    }).then(function (docRef) {
      console.log(`Playlist saved with Id: ${docRef.id}`);
      docRef.update({
        playlistId: docRef.id
      })
    }).catch(function (error) {
      console.log('Got an error:', error);
    })
    this.toggleClosePlaylistPopup();
  }

  toggleEditPlaylistPopup = (editing) => {
    this.setState({
      previousPlaylistName: editing.playlistName,
      previousPlaylistSlug: editing.playlistSlugName,
      playlistId: editing.playlistId,
      addingNewPlaylist: false,
      editPlaylistPopupIsOpen: !this.state.editPlaylistPopupIsOpen
    });
  };

  onEditPlaylist = () => {
    const user = this.state.user;
    console.log(`User id: ${user.uid}`);
    console.log(`Previous playlist name: ${this.state.previousPlaylistName}`)
    console.log(`Previous playlist slug: ${this.state.previousPlaylistSlug}`)
    console.log(`playlist name: ${this.state.playlistName}`);
    console.log(`playlist slug: ${this.state.playlistSlug}`);
    // const docRef = firestore.collection('users').doc(user.uid).collection('playlists');
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${this.state.playlistId}`);
    docRef.update({
      playlistName: this.state.playlistName,
      playlistSlugName: this.state.playlistSlug
    }).then(() => {
      this.setState({
        currentPlaylistName: this.state.playlistName
      })
      console.log('Playlist updated!');
    }).catch(function (error) {
      console.log('Got an error:', error);
    })
    this.toggleClosePlaylistPopup();
  }

  onDeletePlaylist = (item, batchSize) => {
    const user = this.state.user;
    const db = firebase.firestore();
    const docRef = db.doc(`users/${user.uid}/playlists/${item.playlistId}`);
    const collectionRef = db.collection('users').doc(user.uid).collection('playlists').doc(item.playlistId).collection('videos');

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
              toggleAddPlaylistPopup={this.toggleAddPlaylistPopup}
            />
          </StyledAside>
          <StyledMain>
            <SearchBar onVideoSearch={onVideoSearch}/>
            <StyledListsContainer>
              <SearchResults
                searchResults = {this.state.searchResults} 
                videoId={this.state.videoId}
                togglePlayer = {this.togglePlayer}
                togglePlaylistPopup = {this.togglePlaylistPopup}
              />
              <Playlist 
                selectedPlaylist={this.state.selectedPlaylist}
                currentPlaylistName={this.state.currentPlaylistName}
                playlistName={this.state.playlistName}
                playlistVideos={this.state.playlistVideos}
                videoId={this.state.videoId}
                togglePlayer={this.togglePlayer}
                togglePlaylistPopup={this.togglePlaylistPopup}
                toggleEditPlaylistPopup={this.toggleEditPlaylistPopup}
                onRemoveFromPlaylist={this.onRemoveFromPlaylist}
                onDeletePlaylist={this.onDeletePlaylist}
              />
            </StyledListsContainer>
          </StyledMain>
          <PlayerControls
            playPreviousVideo={this.playPreviousVideo}
            togglePlay={this.togglePlay}
            playNextVideo={this.playNextVideo}
            playerIsPlaying={this.state.playerIsPlaying}
            videoTitle={this.state.videoTitle}
            videoChannel={this.state.videoChannel}
            nextVideoId={this.state.nextVideoId}
            previousVideoId={this.state.previousVideoId}
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
        <EditPlaylistPopup
          user={this.state.user}
          open={this.state.editPlaylistPopupIsOpen}
          onClose={this.toggleEditPlaylistPopup}
          slugify={this.slugify}
          onEditPlaylistInputChange={this.onEditPlaylistInputChange}
          onAddPlaylist={this.onAddPlaylist}
          onEditPlaylist={this.onEditPlaylist}
          playlistName={this.state.playlistName}
          playlistSlug={this.state.playlistSlug}
          selectedPlaylist={this.state.selectedPlaylist}
          addingNewPlaylist={this.state.addingNewPlaylist}
        />
        <VideoPlayer
          video={this.state.video}
        />
        
      </div>
    )
  }
}

export default App;
