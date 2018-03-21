import _ from 'lodash';
import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import { keyframes } from 'styled-components';
import YTApi from './components/yt_api'
import SpotifyWebApi from 'spotify-web-api-js';
import YouTubePlayer from 'youtube-player';
import MaterialIcon from 'material-icons-react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Snackbar from 'material-ui/Snackbar';

import axios from 'axios';

//Import app components
import SearchBar from './components/search_bar';
import SearchResults from './components/search_results';
import Sidenav from './components/sidenav';
import PlayerControls from './components/player_controls';
import VideoPlayer from './components/video_player';
import EditPlaylistPopup from './components/edit_playlist_popup.js';
import AddToPlaylistPopup from './components/add_to_playlist_popup.js';
import AddTagsPopup from './components/add_tags_popup.js';
import Playlist from './components/playlist';
import Library from './components/library';
import Browse from './components/browse';
import Users from './components/users';
import User from './components/user';
import Video from './components/video';
import LoginPopup from './components/login_popup.js';
import About from './components/about';
import Terms from './components/terms';
import Privacy from './components/privacy';
import SearchTags from './components/search_tags'

//Import Reset CSS and Basic Styles for everything
import './style/reset.css';
import './style/style.css';

//Youtube Data 3 API Key
const YT_API_KEY = 'AIzaSyBCXlTwhpkFImoUbYBJproK1zSIMQ_9gLA';
let progTimeout;
let progressTimerId;
let updateProgressTimerId;
let mouseTimeout;

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

const animatedBg = keyframes`
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
`;

const StyledContainer = styled.div`
  background: linear-gradient(230deg, rgba(72,43,174,0.65),rgba(155,8,193,0.75),rgba(0,160,151,0.8),rgba(2,153,207,0.75),rgba(51,25,124,0.6));
  background-size: 1000% 1000%;
  animation: ${animatedBg} 100s linear infinite;
  transition: all, .5s ease;
  transition-delay: .5s;
  height: 100vh;
  overflow: hidden;
  ${props => props.playerIsOpen && `
    opacity: 0;
  `}
  ${props => props.interfaceAlwaysOn && `
    opacity: 1 !important;
  `}
  &:hover{
    opacity: 1;
    transition-delay: 0s;
  }
  &.hidden{
    opacity: 0;
  }
`;
const StyledAside = styled.div`
  display: none;
  width: 100%;
  height: 100vh;
  border-right: 1px solid rgba(255,255,255,0.1);
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.4);
  overflow-y: auto;
  z-index: 999;
  ${props => props.visible && `
    display: block;
  `}
  ${media.xmedium`
    width: 240px;
    background: none;
    display: block;
    height: calc(100vh - 60px);
  `}
`;
const StyledMain = styled.div`
  width: 100%;
  left: 0;
  position: relative;
  height: calc(100vh - 120px);
  overflow: hidden;
  ${media.xmedium`
    height: calc(100vh - 60px);
    left: 240px;
    width: calc(100% - 240px);
  `}
`;
const StyledMainHeading = styled.div`
  display: flex;
  align-items: center;
`;
const StyledMainContainer = styled.div`
  display: block;
  ${media.xmedium`
    display: flex;
  `}
`;
const StyledSidenavTrigger = styled.a`
  display: block;
  padding: 28px 0 20px 20px;
  cursor: pointer;
  ${media.xmedium`
    display: none;
  `}
`;


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      user: null,
      //Responsive
      navIsOpen: false,
      //Toggle Interface
      interfaceAlwaysOn: false,
      //Login Popup States
      loginPopupIsOpen: false,
      //Sidenav
      myPlaylists: [],
      followingPlaylists: [],
      //Player States
      playerIsOpen: false,
      playerIsPlaying: false,
      playingFromSearch: false,
      player: null,
      currentPlaylist: null,
      currentVideoNumber: null,
      //current Video States
      video: null,
      videoEtag: null,
      videoId: null,
      videoTitle:  null,
      videoChannel: null,
      //Edit Playlist Popup
      editPlaylistPopupIsOpen: false,
      addingNewPlaylist: false,
      playlistId: '',
      playlistName: '',
      playlistSlug: '',
      //Playlist Popup States
      playlistPopupIsOpen: false,
      videoToBeAdded: null,
      //Playlist States
      selectedPlaylist: null,
      selectedPlaylistPublicInfo: null,
      currentPlaylistName: null,
      playlistVideos: [],
      playlistTags: [],
      //Browse
      browsePlaylists: [],
      popularPlaylists: [],
      featuredPlaylists: [],
      //Import Playlists from Spotify
      playlistUrl: [],
      importingNewPlaylist: false,
      //Import Playlist from Youtube
      importingType: null,
      //Add Tag Popup
      addTagPopupIsOpen: false,
      playlistToAddTag: null,
      //Tags search
      isTagSearch: false,
      tagsToSearch: [],
      tagsSearchResults: [],
      //Progress bar
      progressMax: 0,
      progress: 0,
      //Library
      libraryVideos: [],
      //Snackbar
      snackIsOpen: false,
      snackMessage: "",
      snackAction: ""
    }

    this.player = null;

  };

  componentWillMount() {
    
    //Handle login / logout
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user })
      if (this.state.user){

        //Load Playlists for Sidenav
        let docRef = firebase.firestore().collection('users').doc(this.state.user.uid).collection('playlists');

        docRef = docRef.orderBy("createdOn", "desc");

        docRef.onSnapshot(querySnapshot => {
          const myPlaylists = [];
          querySnapshot.forEach(function (doc) {
            myPlaylists.push(doc.data());
          });
          this.setState({ myPlaylists })        
        });

        //Load Following Playlists for Sidenav
        let followingRef = firebase.firestore().collection('users').doc(this.state.user.uid).collection('following');

        followingRef = followingRef.orderBy("followedOn", "desc");

        followingRef.onSnapshot(querySnapshot => {
          const followingPlaylists = [];
          querySnapshot.forEach(function (doc) {
            followingPlaylists.push(doc.data());
          });
          this.setState({ followingPlaylists })
        });

        let libraryRef = firebase.firestore().collection('users').doc(this.state.user.uid);
        libraryRef.onSnapshot((doc) => {
          if (doc.exists) {
            this.setState({
              libraryVideos: doc.data().libraryVideos ? doc.data().libraryVideos : []
            })
          }
        });

        /* const libraryRef = firebase.firestore().collection('users').doc(this.state.user.uid).collection('library');
        libraryRef.onSnapshot(querySnapshot => {
          const libraryVideos = [];
          querySnapshot.forEach(function (doc) {
            libraryVideos.push(doc.data());
          });
          this.setState({libraryVideos});
        }); */
      };
    });

    //Browse Playlists Rutes
    let browseRef = firebase.firestore().collection('playlists');

    //Order Browse by Most Recent
    browseRef = browseRef.orderBy("createdOn", "desc");

    //Listen and set State for Recent Playlists
    browseRef.onSnapshot(querySnapshot => {
      const browsePlaylists = [];
      querySnapshot.forEach(function (doc) {
        browsePlaylists.push(doc.data());
      });
      this.setState({ browsePlaylists })
    });

    //Browse Popular Playlists Rutes
    let popularRef = firebase.firestore().collection('playlists');

    //Order Browse by Most Popular (based on number of followers)
    popularRef = popularRef.orderBy("followers", "desc");

    //Listen and set State for Popular Playlist
    popularRef.onSnapshot(querySnapshot => {
      const popularPlaylists = [];
      querySnapshot.forEach(function (doc) {
        popularPlaylists.push(doc.data());
      });
      this.setState({ popularPlaylists })
    });

    //Browse Featured Playlists Rutes
    let featuredRef = firebase.firestore().collection('playlists');

    //Show featured playlists
    featuredRef = featuredRef.where("featured", "==", true);

    // Listen and set State for Featured Playlists
    featuredRef.onSnapshot(querySnapshot => {
      const featuredPlaylists = [];
      querySnapshot.forEach(function (doc) {
        featuredPlaylists.push(doc.data());
      });
      this.setState({ featuredPlaylists })
    });

  };

  componentDidMount(){

    this.player = YouTubePlayer('video-player', {
      videoId: null,
      playerVars: {
        controls: 0,
        showinfo: 0,
        rel: 0,
      }
    });
    
    this.player.on('stateChange', (event) => { 
      //Update the current video to the next in list.
      if (event.data === 0) { 
        console.log('MyStateChange', event.data);

        this.changeVideo(true);
      }
      else if (event.data === 1) {
        const self = this;
        this.player.getDuration().then(playerTotalTime => this.setState({progressMax: playerTotalTime}))
        clearInterval(updateProgressTimerId)

        const progressUpdate = () => {
          this.player.getCurrentTime().then(playerCurrentTime => {
            let progressCount = playerCurrentTime
            clearInterval(progressTimerId)
  
            progressTimerId = setInterval(() => {
              progressCount = progressCount + 0.5
              self.setState({progress: progressCount});
            }, 500)
          })
        }

        progressUpdate()
        updateProgressTimerId = setInterval(progressUpdate, 6000)
      }
      //video playling
      /* else if (event.data === 1) {
        const self = this;
        this.player.getDuration().then(playerTotalTime => {
          this.setState({progressMax: playerTotalTime});
          clearInterval(progressTimerId);
          progressTimerId = setInterval(function() {
            self.player.getCurrentTime().then(playerCurrentTime=> {
              self.setState({progress: playerCurrentTime});             
            });
          }, 1000);    
        });
      } */
      //video paused
      else if (event.data === 2) {
        clearInterval(updateProgressTimerId)               
        clearInterval(progressTimerId);
      }
    });
    
    // Hide inteface after 5 seconds of mouse inactivity

    document.onmousemove = () => {

      if (this.state.playerIsOpen !== false ){

        document.getElementById("interface").classList.remove('hidden');

        clearTimeout(mouseTimeout);

        mouseTimeout = setTimeout( () => {
          document.getElementById("interface").classList.add('hidden');
          console.log('hidding interface after 5 seconds of mouse inactivity');
        }, 5000);

      }

    }

  };

  componentDidUpdate(prevProps, prevState){

    // if(this.state.videoId !== prevState.videoId){
    //   this.state.player.loadVideoById(this.state.videoId);
    // }

    if (document.getElementById("input-playlist-popup") !== null) {
      document.getElementById("input-playlist-popup").focus();
    }
    
  };


//Methods

  changeVideo = (isNext = true) => {

    this.setState((prevState) => {

      let nextVideoNumber;
      if (isNext) {
        nextVideoNumber = prevState.currentVideoNumber !== prevState.playlistVideos.length - 1 ? prevState.currentVideoNumber + 1 : 0;
      } else {
        nextVideoNumber = prevState.currentVideoNumber !== 0 ? prevState.currentVideoNumber - 1 : prevState.playlistVideos.length - 1;
      }
      const nextVideo = prevState.playlistVideos[nextVideoNumber];

      console.log('MyStateChange', nextVideo);

      this.player.loadVideoById(nextVideo.videoID ? nextVideo.videoID : nextVideo.id.videoId);
      return {
        ...prevState,
        currentVideoNumber: nextVideoNumber,
        video: nextVideo,
        videoId: nextVideo.videoID || nextVideo.id.videoId,
        videoTitle: nextVideo.videoTitle || nextVideo.snippet.title,
        videoChannel: nextVideo.videoChannel || nextVideo.snippet.channelTitle,
      }
    });
  };

  toggleInterface = () => {
    this.setState({
      interfaceAlwaysOn: !this.state.interfaceAlwaysOn
    })
  };

  toggleNav = () => {
    console.log(`nav is open: ${this.state.navIsOpen}`);
    this.setState({
      navIsOpen: !this.state.navIsOpen
    });
  };

  onVideoSearch = (searchTerm) => {
    if (searchTerm === ''){
      this.setState({
        searchResults: [],
        playingFromSearch: false
      })
      return null;
    }

    YTApi.Search({ part: 'snippet', key: YT_API_KEY, q: searchTerm, type: 'video', maxResults: 10, })
    .then((searchResults)=> {    
      this.setState({
        searchResults: searchResults
      })
    });
  };

  onAddTagSearch = (e) => {
    e.preventDefault();

    const newTagsToSearch = [];
    if (this.state.tagsToSearch.length > 0) this.state.tagsToSearch.forEach((tag) => newTagsToSearch.push(tag));
    newTagsToSearch.push(e.target.tagInput.value);

    this.onTagSearch(newTagsToSearch);
    this.toggleAddTagPopup();    
  };

  onRemoveTagSearch = (newTagsToSearch) => {
    this.onTagSearch(newTagsToSearch);   
  };

  onTagSearch = (searchArray) => {
    let results = [];
    if (searchArray.length > 0) {
      results = this.state.browsePlaylists.filter((playlist) => {
        const isMatch = [];
        searchArray.forEach((term)=> {
          if (playlist.tags && playlist.tags.length > 0) {
            const matches = playlist.tags.some((tag)=> {
              const reg = new RegExp(term, 'i');
              return reg.test(tag);
            });
            isMatch.push(matches);
          } else isMatch.push(false);
        });

        return isMatch.every((value)=> value === true);     
      });
    } else {
      results = [];
    }
    
    this.setState({tagsSearchResults: results, tagsToSearch: searchArray})   
  };

  onLogin = (source) => {

    let provider = null;

    if (source === 'google'){
      provider = new firebase.auth.GoogleAuthProvider();
    } else if (source === 'facebook') {
      provider = new firebase.auth.FacebookAuthProvider();
    }

    firebase.auth().signInWithPopup(provider)
    .then((result) => { 
      const user = result.user;
      this.setState({
        user: user
      });
      
      const userRef = firebase.firestore().doc(`users/${user.uid}`);

      userRef.get().then(function (doc) {
        if (doc.exists) {
          userRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            displayName: user.displayName,
            photoURL: user.photoURL,
            uid: user.uid,
          }).then(() => {
            console.log(`User updated succesfully`);
          }).catch(function (error) {
            console.log('Got an error:', error);
          })
        } else {
          userRef.set({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            displayName: user.displayName,
            photoURL: user.photoURL,
            uid: user.uid,
            joinedOn: user.metadata.creationTime,
            libraryVideos: [],
            libraryVideoCount: 0,
            libraryOrderBy: 'timestamp',
            libraryOrderDirection: 'asc',
          }).then(() => {
            console.log(`User created succesfully`);
          }).catch(function (error) {
            console.log('Got an error:', error);
          })
        }
      }).catch(function (error) {
        console.log("Error getting document:", error);
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

  onBrowse = () => {
    this.setState({
      selectedPlaylist: null,
      playlistIsOpen: false,
    })
    console.log(`Browsing: ${this.state.playlistIsOpen}`)
  };

  onPlaylistFollow = (playlist, playlistFollowers) => {
    
    if (this.state.user === null) {

      this.setState({
        loginPopupIsOpen: !this.state.loginPopupIsOpen
      });

    } else {
      
      const user = this.state.user;
      
      //Route to User Following Playlist Collection
      const followRef = firebase.firestore().collection('users').doc(user.uid).collection('following').doc(playlist.playlistId);
      const publicPlaylistsRef = firebase.firestore().collection('playlists').doc(playlist.playlistId);
      
      firebase.firestore().runTransaction((transaction) => {
          //get playlistsRef
          return transaction.get(publicPlaylistsRef).then(function(playlistDoc) {
            return playlistDoc
          }).then((playlistDoc)=> {
            return transaction.get(followRef).then(function(doc) {
              //Checking if the user is already following the playlist and if they do, Unfollow.
              if (doc.exists) {
                //Unfollow
                console.log(`Removing Playlist: ${playlist.playlistName}.`);
                transaction.delete(followRef);

                //Update count on public playlists collections
                transaction.update(publicPlaylistsRef, {
                  followers: playlistDoc.data().followers - 1
                });
              }

              //If the user does not follow the playlist. Follow.
              else {
                transaction.set(followRef, {
                  followedOn: firebase.firestore.FieldValue.serverTimestamp(),
                  playlistId: playlist.playlistId,
                  playlistName: playlist.playlistName,
                  playlistSlug: playlist.playlistSlugName,
                  Author: playlist.Author,
                  AuthorId: playlist.AuthorId
                });

                //Update count on public playlists collections
                transaction.update(publicPlaylistsRef, {
                  followers: playlistDoc.data().followers + 1
                });
              }
            });
          });
      }).then(function() {
          console.log("Transaction successful");
      }).catch(function(error) {
          console.log("Transaction failed: ", error);
      });
    }
  };

  onPlaylistUnfollow = (playlistId) => {
    const user = this.state.user;
    const followRef = firebase.firestore().collection("users").doc(user.uid).collection('following').doc(playlistId);
    followRef.get().then((doc) => {
      if (doc.exists) {
        const docRef = firebase.firestore().doc(`users/${user.uid}/following/${playlistId}`);
        docRef.delete().then(() => {
          console.log("Document successfully deleted!");
          this.props.history.push(`/`);
        }).catch(function (error) {
          console.error("Error removing document: ", error);
        });
      } 
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });
  };

  //Play controls for playlists and search results Methods

  togglePlayer = (video, playlist, playlistVideos, source) => {

    //Play Selected Video from the playlist
    const videoId = video.videoID;
    const videoTitle = video.videoTitle;
    const videoChannel = video.videoChannel;
    
    this.player.loadVideoById(videoId);

    this.setState({
      playerIsOpen: true,
      playerIsPlaying: true,
      playingFromSearch: false,
      playlistVideos: playlistVideos,
      currentPlaylist: playlist,
      currentVideoNumber: playlistVideos.indexOf(video),
      video,
      videoId,
      videoTitle,
      videoChannel,
    });

    this.setSnackbar(`Currently playing: ${videoTitle} - from ${playlist.playlistName || `Library`}`);

  };

  toggleWatchPlayer = (video) => {

    const videoId = video.videoID;
    const videoTitle = video.videoTitle;
    const videoChannel = video.videoChannel;

    console.log(videoId);

    this.player = YouTubePlayer('video-player', {
      videoId: video.videoID,
      playerVars: {
        controls: 0,
        showinfo: 0,
        rel: 0,
      }
    });

    this.player.playVideo();


    this.setState({
      playerIsOpen: true,
      playerIsPlaying: true,
      playingFromSearch: false,
      video,
      videoId,
      videoTitle,
      videoChannel,
    });

  }

  toggleSearchPlayer = (video) => {
   
    //Play Selected Video from the search results
    const videoId = video.id.videoId;
    const videoTitle = video.snippet.title;
    const videoChannel = video.snippet.channelTitle;
    

    this.setState((prevState) => {
      const index = prevState.searchResults.indexOf(video)
      this.player.loadVideoById(videoId);
      return {
        playerIsOpen: true,
        playerIsPlaying: true,
        playingFromSearch: true,
        playlist: null,
        currentVideoNumber: (index > -1 ) ? index : 0,
        playlistVideos: prevState.searchResults,
        video,
        videoId,
        videoTitle,
        videoChannel,
      }
      
    });

    this.setSnackbar(`Currently playing: ${videoTitle} from Search Results`);
    
  };

  playNextVideo = (video) => {

    if (!video){
      return null;
    }

    this.changeVideo(true);

  };

  playNextSearchVideo = (video) => {

    if (!video) {
      return null;
    }
    this.changeVideo(true);

    console.log(`The current video number is ${this.state.currentVideoNumber} out of ${this.state.searchResults.length}`);
    
  };

  playPreviousVideo = (video) => {

    if (!video) {
      return null;
    }

    this.changeVideo(false);

  };

  playPreviousSearchVideo = (video) => {
    this.changeVideo(false);
  };

  togglePlay = () => {
    if (this.state.playerIsPlaying === true) {
      this.player.pauseVideo();
    } else {
      this.player.playVideo();
    }
    this.setState({
      playerIsPlaying: !this.state.playerIsPlaying
    })
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

  toggleAddTagPopup = (playlistToAddTag, isTagSearch) => {
    const tagSearch = isTagSearch? true : false;
    this.setState({
      addTagPopupIsOpen: !this.state.addTagPopupIsOpen,
      isTagSearch: tagSearch
    });
    this.setState({ playlistToAddTag })
  };

  onAddToPlaylist = (video, item, autoAdd) => {
    const self = this;

    const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
    const videoId = typeof video.id !== 'undefined' ? video.id.videoId : video.videoID;
    const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
    const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;
    const datePublished = typeof video.snippet !== 'undefined' ? video.snippet.publishedAt : video.datePublished;
    const duration = typeof video.contentDetails !== 'undefined' ? video.contentDetails.duration : video.duration ? video.duration : null;

    const user = this.state.user;

    //Add song to playlist
    const docRef = firebase.firestore().collection('users').doc(user.uid).collection('playlists').doc(item.playlistId);
    const publicPlaylistRef = firebase.firestore().collection('playlists').doc(item.playlistId);

    docRef.get().then((doc)=> {
      if (!doc.exists) throw new Error("Playlist not found");

      let playlistVideos = [];
      
      if (doc.data().playlistVideos && Array.isArray(doc.data().playlistVideos)) {
        playlistVideos = doc.data().playlistVideos;
      }

      //Find duplicates
      if (playlistVideos.some((track) => track.videoID === videoId)) {
        throw new Error("Track already on playlist!");
      }

      docRef.update({
        playlistVideos: [...playlistVideos, {
          timestamp: new Date(),
          videoEtag: videoEtag,
          videoID: videoId,
          videoTitle: videoTitle,
          videoChannel: videoChannel,
          datePublished: datePublished,
          duration: duration,
        }],
        videoCount: playlistVideos.length + 1
      })
      .then(() => self.setSnackbar(`${videoTitle} added to playlist`));

      publicPlaylistRef.update({
        videoCount: playlistVideos.length + 1
      });

    }).catch(function(error) {
      self.setSnackbar(error.toString());
    });

    if (autoAdd) return

    this.setState({
      playlistPopupIsOpen: !this.state.playlistPopupIsOpen
    });
  };

  onRemoveFromPlaylist = (videoId, item) => {
    console.log(`Removing: ${videoId} from ${item.playlistName}`)
    const user = this.state.user;
    const self = this;

    const docRef = firebase.firestore().collection('users').doc(user.uid).collection('playlists').doc(item.playlistId);
    const publicPlaylistRef = firebase.firestore().collection('playlists').doc(item.playlistId);

    docRef.get().then((doc)=> {
      if (!doc.exists) throw new Error("Playlist not found");

      docRef.update({
        playlistVideos: doc.data().playlistVideos.filter((track) => track.videoID !== videoId),
        videoCount: doc.data().playlistVideos.length - 1
      })
      .then(() => self.setSnackbar(`Video removed from ${item.playlistName}`));

      publicPlaylistRef.update({
        videoCount: doc.data().playlistVideos.length - 1
      })

    }).catch(function(error) {
      self.setSnackbar(error.toString());
    });
  };

  onAddToLibrary = (video, autoAdd) => {
    const self = this;

    const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
    const videoId = typeof video.id !== 'undefined' ? video.id.videoId : video.videoID;
    const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
    const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;
    const datePublished = typeof video.snippet !== 'undefined' ? video.snippet.publishedAt : video.datePublished;
    const duration = typeof video.contentDetails !== 'undefined' ? video.contentDetails.duration : video.duration ? video.duration : null;

    const user = this.state.user;

    //Add song to library
    const docRef = firebase.firestore().doc(`users/${user.uid}`);

    docRef.get().then((doc)=> {
      if (!doc.exists) throw new Error("User not found");

      let libraryVideos = [];
      
      if (doc.data().libraryVideos && Array.isArray(doc.data().libraryVideos)) {
        libraryVideos = doc.data().libraryVideos;
      }

      //Find duplicates
      if (libraryVideos.some((track) => track.videoID === videoId)) {
        throw new Error("Track already on library!");
      }

      docRef.update({
        libraryVideos: [...libraryVideos, {
          timestamp: new Date(),
          videoEtag: videoEtag,
          videoID: videoId,
          videoTitle: videoTitle,
          videoChannel: videoChannel,
          datePublished: datePublished,
          duration: duration,
        }],
        libraryVideoCount: libraryVideos.length + 1
      })
      .then(() => self.setSnackbar(`${videoTitle} added to library`));

    }).catch(function(error) {
      self.setSnackbar(error.toString());
    });

    if (autoAdd) return

    this.setState({
      playlistPopupIsOpen: !this.state.playlistPopupIsOpen
    });
  }

  onRemoveFromLibrary = (video) => {
    const user = this.state.user;
    const self = this;
    const videoID = video.videoID ? video.videoID : video.id.videoId
    const videoTitle = video.videoTitle ? video.videoTitle : video.snippet.title

    const docRef = firebase.firestore().doc(`users/${user.uid}`);

    docRef.get().then((doc)=> {
      if (!doc.exists) throw new Error("User not found");

      docRef.update({
        libraryVideos: doc.data().libraryVideos.filter((libraryTrack) => libraryTrack.videoID !== videoID),
        libraryVideoCount: doc.data().libraryVideos.length - 1
      })
      .then(() => self.setSnackbar(`${videoTitle} removed from Library.`));

    }).catch(function(error) {
      self.setSnackbar(error.toString());
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
  };

  onEditPlaylistInputChange = (event) => {
    this.setState({
      playlistName: event.target.value,
      playlistSlug: this.slugify(event.target.value)
    });
  };

  onImportPlaylistInputChange = (event) => {
    this.setState({
      playlistUrl: event.target.value
    });
  };

  onImportPlaylistDrop = (event) => {
    event.preventDefault();

    this.toggleImportPlaylistPopup('Spotify', true);
    this.setState({
      playlistUrl: event.dataTransfer.getData("URL")
    });
  };

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

  toggleImportPlaylistPopup = (type, dontHide) => {
    const toggle = dontHide === true ? true : !this.state.editPlaylistPopupIsOpen;
    
    this.setState({
      addingNewPlaylist: false,
      importingNewPlaylist: true,
      importingType: type,
      previousPlaylistName: '',
      previousPlaylistSlug: '',
      playlistName: '',
      playlistSlug: '',
      playlistUrl: '',
      editPlaylistPopupIsOpen: toggle
    });
  };

  onAddPlaylist = (playlistName, playlistUrl, callback) => {
    const user = this.state.user;
    const playlistSlugName = this.slugify(playlistName);

    const spotifyUrl = typeof playlistUrl === "string" 
      && (/spotify/i).test(playlistUrl) 
      ? playlistUrl 
      : null;

    const youtubeUrl = typeof playlistUrl === "string" 
      && (/youtube/i).test(playlistUrl)
      ? playlistUrl
      : null;

    console.log(`User id: ${user.uid}`);
    console.log(`playlist name: ${playlistName}`);
    console.log(`playlist slug: ${playlistSlugName}`);

    const docRef = firebase.firestore().collection('users').doc(user.uid).collection('playlists');
    docRef.add({
      createdOn: firebase.firestore.FieldValue.serverTimestamp(),
      playlistName: playlistName,
      playlistSlugName: playlistSlugName,
      Author: user.displayName,
      AuthorId: user.uid,
      videoCount: 0,
      followers: 0,
      featured: false,
      orderBy: 'custom',
      orderDirection: 'asc',
      playlistVideos: [],
      spotifyUrl: spotifyUrl,
      youtubeUrl: youtubeUrl
    }).then((docRef) => {
      console.log(`Playlist saved with Id: ${docRef.id}`);
      docRef.update({
        playlistId: docRef.id
      })
      const playlistsRef = firebase.firestore().doc(`playlists/${docRef.id}`);
      playlistsRef.set({
        createdOn: firebase.firestore.FieldValue.serverTimestamp(),
        playlistName: playlistName,
        playlistSlugName: playlistSlugName,
        playlistId: docRef.id,
        Author: user.displayName,
        AuthorId: user.uid,
        videoCount: 0,
        followers: 0,
        featured: false
      }).then(function(){
        if (typeof callback === 'function') callback(docRef.id);
        console.log(`Playlist saved globally with Id: ${docRef.id}`);
      }).catch(function (error){
        console.log('Got an error:', error);
      });
    }).catch(function (error) {
      console.log('Got an error:', error);
    })
    
    if (!typeof playlistUrl === "string") this.toggleClosePlaylistPopup();
  };

  toggleEditPlaylistPopup = (playlist) => {
    this.setState({
      playlistName: playlist.playlistName,
      playlistSlug: playlist.playlistSlugName,
      playlistId: playlist.playlistId,
      playlistUrl: playlist.playlistUrl,
      addingNewPlaylist: false,
      importingNewPlaylist: false,
      editPlaylistPopupIsOpen: !this.state.editPlaylistPopupIsOpen
    });
  };

  onEditPlaylist = (playlistName) => {
    const user = this.state.user;
    const playlistSlugName = this.slugify(playlistName);
    
    //Get Refs to public and user playlists
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${this.state.playlistId}`);
    const playlistRef = firebase.firestore().doc(`playlists/${this.state.playlistId}`);
    
    //Update User Playlist
    docRef.update({
      playlistName: playlistName,
      playlistSlugName: playlistSlugName
    }).then(() => {
      this.setState({
        currentPlaylistName: playlistName
      })
      console.log('Playlist updated!');
    }).catch(function (error) {
      console.log('Got an error:', error);
    })

    //Update Public Playlists
    playlistRef.update({
      playlistName: playlistName,
      playlistSlugName: playlistSlugName
    }).then(() => {
      console.log('Public Playlist updated!');
    }).catch(function (error) {
      console.log('Got an error:', error);
    })

    this.toggleClosePlaylistPopup();
  };

  batchAdd = (playlistIdRef, items, isUpdate, kind) => {
    let seen = [];
    const db = firebase.firestore();
    const playlistVideos = [];
    const user = this.state.user;
    const self = this;

    items.forEach((video) => {
      if (video) {
        const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
        const videoId = typeof video.id !== 'undefined' ? typeof video.id.videoId !== 'undefined' ? video.id.videoId : video.snippet.resourceId.videoId : video.videoID;
        const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
        const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;
        const datePublished = typeof video.snippet !== 'undefined' ? video.snippet.publishedAt : video.datePublished;
        const duration = typeof video.contentDetails !== 'undefined' ? video.contentDetails.duration : video.duration ? video.duration : null;

        //dont set if video is duplicated
        if (!seen.some((id) => id === videoId)) {
          playlistVideos.push({
            timestamp: new Date(),
            videoEtag: videoEtag,
            videoID: videoId,
            videoTitle: videoTitle,
            videoChannel: videoChannel,
            datePublished: datePublished,
            duration: duration,
          })

          seen.push(videoId);
        }
      }
    });

    const userPlaylistRef = db.collection('users').doc(user.uid).collection('playlists').doc(playlistIdRef);
    const publicPlaylistRef = db.collection('playlists').doc(playlistIdRef);

    let playlistItem = {
      videoCount: playlistVideos.length,
    }

    //Add a Spotify tag if it's a new playlist
    if (!isUpdate && kind === 'Spotify') playlistItem.tags = ["Spotify"]

    publicPlaylistRef.update(playlistItem).catch((error) => {
      throw new Error(error); 
    });

    playlistItem.playlistVideos = playlistVideos

    userPlaylistRef.update(playlistItem)
    .then(() => {
      if (isUpdate !== true) self.setSnackbar("Successfully imported!");
      else self.setSnackbar("Successfully updated!");
    }).catch((error) => {
      throw new Error(error); 
    });
  } 

  onImportPlaylist = (url, isUpdate, playlist) => {
    const playlistUrl = isUpdate === true ? playlist.spotifyUrl : url;
    
    if (!playlistUrl.match(/user\/.+playlist\/[^/|?]+/)) {
      this.setSnackbar("Plase enter a valid Spotify playlist");
      return;
    }

    const self = this;
    const userId = playlistUrl.match(/user.([^/]+)/);
    const playlistId = playlistUrl.match(/playlist.([^/|?]+)/);
    let allTracks = [];

    if (isUpdate !== true) this.setSnackbar("Importing playlist...");

    //Fetch Spotify Web Api token with Google Apps Script
    //Using Google Apps Script to not expose client secret
    const spotifyApi = new SpotifyWebApi();
    const APPS_SCRIPT_TOKEN = "https://script.google.com/macros/s/AKfycbwxAkZ3StrS7tfLY1byXtKRCQF2k6PHVfjUNebnvfeEHq8CUdAR/exec";
    

    axios.get(APPS_SCRIPT_TOKEN).then((token)=> {      
      spotifyApi.setAccessToken(token.data.access_token);

      function getNext(nextPage, prevData) {
        if (nextPage) {
          const reg = new RegExp(/offset=([0-9]+)/, 'i');
          const offset = reg.exec(nextPage)[1];
          
          spotifyApi.getPlaylistTracks(userId[1], playlistId[1], {offset: offset})
          .then((nextData)=> {
            nextData.items.forEach((nextItem=> allTracks.push(nextItem)));
            getNext(nextData.next, prevData);
          }).catch((error) => {
            throw new Error(error); 
          });
        }
        else {
          const promises = [];

          allTracks.forEach((trackObj) => {
            const searchTerm = trackObj.track.name + " " + trackObj.track.artists[0].name;
            promises.push(YTApi.Search({ part: 'snippet', key: YT_API_KEY, q: searchTerm, type: 'video', maxResults: 1 }));
          });

          Promise.all(promises)
          .then((results)=> {
            results = results.map((result) => result[0]);
            if (isUpdate === true) {
              self.batchAdd(playlist.playlistId, results, isUpdate, 'Spotify');
            }
            else {
              self.onAddPlaylist(prevData.name, playlistUrl, (docRefId) => {
                self.batchAdd(docRefId, results, isUpdate, 'Spotify');
              });
            }
          }).catch((error) => {
            throw new Error(error); 
          });
        }
      }

      spotifyApi.getPlaylist(userId[1], playlistId[1])
      .then((data)=> {
        allTracks = data.tracks.items.map(item=>item);
        getNext(data.tracks.next, data);
      }).catch((error) => {
        self.setSnackbar(error.toString()); 
      });      
    }).catch((error)=> {
      console.log(error);
      self.setSnackbar("Couldn't reach Spotify. Please try again later.");    
    });

    if (isUpdate === true) return;
    this.toggleImportPlaylistPopup();
  }

  onImportFromYoutube = (url, isUpdate, playlist) => {

    const playlistUrl = isUpdate === true ? playlist.youtubeUrl : url;

    if (!playlistUrl.match(/(youtube|youtu.be).+list=([^/|?|&]+)/)) {
      this.setSnackbar("Plase enter a valid YouTube playlist");
      return;
    }
    
    const self = this;

    const playlistId = playlistUrl.match(/list=([^/|?|&]+)/)[1];

    if (isUpdate !== true) this.setSnackbar("Importing playlist...");

    YTApi.playlistItems({ part: 'snippet', key: YT_API_KEY, id: playlistId })
    .then((playlistItems)=> {
      
      if (isUpdate) {
        self.batchAdd(playlist.playlistId, playlistItems.playlistItems.items, isUpdate, 'YouTube');
      }
      else {
        self.onAddPlaylist(playlistItems.snippet.title, playlistUrl, (docRefId) => {
          self.batchAdd(docRefId, playlistItems.playlistItems.items, isUpdate, 'YouTube');
        });
      }
      

    }).catch((error) => {
      self.setSnackbar(error.toString()); 
    });

    if (isUpdate === true) return;
    this.toggleImportPlaylistPopup();
  }

  onUpdatePlaylist = (playlist) => {

    this.setSnackbar("Updating playlist...");

    if (playlist.spotifyUrl) this.onImportPlaylist(null, true, playlist);
    else if (playlist.youtubeUrl) this.onImportFromYoutube(null, true, playlist);

  }

  onDeletePlaylist = (playlist, batchSize) => {
    const user = this.state.user;
    const self = this;
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${playlist.playlistId}`);
    const playlistsRef = firebase.firestore().doc(`playlists/${docRef.id}`);

    docRef.delete().then(() => {
      playlistsRef.delete().then(() => {
        console.log(`${docRef.id} Document successfully deleted!`);
        self.props.history.push(`/users/${user.uid}`);
      }).catch((error) => {
        console.error("Error removing document: ", error);
      });
    }).catch((error) => {
      console.error("Error removing document: ", error);
    });
  }

  /* onDeletePlaylist = (playlist, batchSize) => {
    const user = this.state.user;
    const db = firebase.firestore();
    const docRef = db.doc(`users/${user.uid}/playlists/${playlist.playlistId}`);
    const collectionRef = db.collection('users').doc(user.uid).collection('playlists').doc(playlist.playlistId).collection('videos');

    let self = this;

    if (batchSize !== 0) {

      const query = collectionRef.orderBy('__name__').limit(batchSize);

      return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
        deletePlaylistDoc(docRef, playlist, self);
      });
    } else {
      return new Promise((resolve, reject) => {
        deletePlaylistDoc(docRef, playlist, self);
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

    function deletePlaylistDoc(docRef, playlist, self) {
      docRef.delete().then(() => {
        const playlistsRef = firebase.firestore().doc(`playlists/${docRef.id}`);
        playlistsRef.delete().then(function () {
          console.log(`${docRef.id} Document successfully deleted!`);
          self.props.history.push(`/users/${user.uid}`);
          // self.setState({
          //   playlistVideos: [],
          // });
        }).catch(function (error) {
          console.error("Error removing document: ", error);
        });
      }).catch(function (error) {
        console.error("Error removing document: ", error);
      });
    }
  }; */

  onAddTag = (e) => {
    e.preventDefault();

    const user = this.state.user;
    //Capitalize each word
    const newTag = e.target.tagInput.value.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    
    const docRef = firebase.firestore().collection('users').doc(user.uid).collection('playlists').doc(this.state.playlistToAddTag.playlistId);
    const playlistRef = firebase.firestore().collection('playlists').doc(this.state.playlistToAddTag.playlistId);

    //Update User Playlist
    docRef.get().then(
      (doc) => {
        if (doc.exists) {
          let currentTags = doc.data().tags;
          if (currentTags) currentTags.push(newTag);
          else currentTags = [newTag];            

          docRef.update({
            tags: currentTags
          }).then(() => {
            console.log('Playlist updated!');
          }).catch(function (error) {
            console.log('Got an error:', error);
          })
        }
      }
    );

    //Update Public Playlists
    playlistRef.get().then(
      (doc) => {
        if (doc.exists) {
          let currentTags = doc.data().tags;
          if (currentTags) currentTags.push(newTag);
          else currentTags = [newTag];            

          playlistRef.update({
            tags: currentTags
          }).then(() => {
            console.log('Playlist updated!');
          }).catch(function (error) {
            console.log('Got an error:', error);
          })
        }
      }
    );

    this.toggleAddTagPopup();
  };

  onRemoveTag = (newTags, playlistItem) => {
    const user = this.state.user;
    
    const docRef = firebase.firestore().collection('users').doc(user.uid).collection('playlists').doc(playlistItem.playlistId);
    const playlistRef = firebase.firestore().collection('playlists').doc(playlistItem.playlistId);

    //Update User Playlist
    docRef.get().then(
      (doc) => {
        if (doc.exists) {          
          docRef.update({
            tags: newTags
          }).then(() => {
            console.log('Playlist updated!');
          }).catch(function (error) {
            console.log('Got an error:', error);
          })
        }
      }
    );

    //Update Public Playlists
    playlistRef.get().then(
      (doc) => {
        if (doc.exists) {
          playlistRef.update({
            tags: newTags
          }).then(() => {
            console.log('Playlist updated!');
          }).catch(function (error) {
            console.log('Got an error:', error);
          })
        }
      }
    );
  }

  onProgressChange = (time) => {
    const self = this;
    this.setState({progress: time});
    if (progTimeout) clearTimeout(progTimeout); 
    progTimeout = setTimeout(() => {self.player.seekTo(time)}, 100);
  }

  setSnackbar = (message, action) => {
    action = action ? action : "";

    this.setState({
      snackIsOpen: true,
      snackMessage: message,
      snackAction: action
    });
  }

  closeSnackbar = () => {
    this.setState({
      snackIsOpen: false
    });
  }

  onSnackbarAction = (action) => {
    console.log(action);    
  }

//Render

  render() {

    const onVideoSearch = _.debounce((searchTerm) => { this.onVideoSearch(searchTerm) }, 300);

    return (
      <div>
        <StyledContainer id="interface"
          playerIsOpen={this.state.playerIsOpen}
          interfaceAlwaysOn={this.state.interfaceAlwaysOn}
          interfaceOff={this.state.interfaceOff}
        >
          <StyledAside visible={this.state.navIsOpen} onClick={() => this.toggleNav()}>
            <Sidenav
              onLogin={this.onLogin}
              onLogout={this.onLogout}
              user={this.state.user}
              myPlaylists={this.state.myPlaylists}
              followingPlaylists={this.state.followingPlaylists}
              toggleAddPlaylistPopup={this.toggleAddPlaylistPopup}
              toggleImportPlaylistPopup={this.toggleImportPlaylistPopup}
              toggleInterface={this.toggleInterface}
              onImportPlaylistDrop={this.onImportPlaylistDrop}
            />
          </StyledAside>
          <StyledMain>
            <StyledMainHeading>
              <StyledSidenavTrigger onClick={() => this.toggleNav()}>
                <MaterialIcon icon="menu" color='#fff' />
              </StyledSidenavTrigger>
              <SearchBar onVideoSearch={onVideoSearch}/>
            </StyledMainHeading>
            <StyledMainContainer>
              <SearchResults
                user = {this.state.user}
                searchResults = {this.state.searchResults} 
                videoId={this.state.videoId}
                togglePlayer = {this.togglePlayer}
                toggleSearchPlayer = {this.toggleSearchPlayer}
                togglePlaylistPopup = {this.togglePlaylistPopup}
                libraryVideos={this.state.libraryVideos}
                onAddToLibrary={this.onAddToLibrary}
                onRemoveFromLibrary={this.onRemoveFromLibrary}
              />     
              <Switch>
                <Route exact path='/' render={({ match }) =>
                  <Browse
                    user={this.state.user}
                    browsePlaylists={this.state.browsePlaylists}
                    popularPlaylists={this.state.popularPlaylists}
                    featuredPlaylists={this.state.featuredPlaylists}
                    onPlaylistFollow={this.onPlaylistFollow}
                  /> }
                />
                <Route exact path='/watch/:videoId' render={({ match }) =>
                  <Video
                    match={match}
                    toggleWatchPlayer={this.toggleWatchPlayer}
                  />} 
                  
                />
                <Route exact path='/users' component={Users} />
                <Route exact path='/users/:profileId' render={({ match }) =>
                  <User
                    match={match}
                    user={this.state.user}
                    onPlaylistFollow={this.onPlaylistFollow}
                    onPlaylistUnfollow={this.onPlaylistUnfollow}
                  />}
                />
                <Route exact path='/users/:profileId/library' render={({ match }) =>
                  <Library
                    match={match}
                    user={this.state.user}
                    videoId={this.state.videoId}
                    browsePlaylists={this.state.browsePlaylists}
                    popularPlaylists={this.state.popularPlaylists}
                    featuredPlaylists={this.state.featuredPlaylists}
                    onPlaylistFollow={this.onPlaylistFollow}
                    togglePlayer={this.togglePlayer}
                    libraryVideos={this.state.libraryVideos}
                    onAddToLibrary={this.onAddToLibrary}
                    onRemoveFromLibrary={this.onRemoveFromLibrary}
                    togglePlaylistPopup={this.togglePlaylistPopup}
                  /> }
                />
                <Route exact path='/users/:profileId/:playlistId' render={({ match }) =>
                  <Playlist
                    match={match}
                    key={window.location.href}
                    user={this.state.user}
                    playlistVideos={this.state.playlistVideos}
                    libraryVideos={this.state.libraryVideos}
                    videoId={this.state.videoId}
                    togglePlayer={this.togglePlayer}
                    togglePlaylistPopup={this.togglePlaylistPopup}
                    toggleEditPlaylistPopup={this.toggleEditPlaylistPopup}
                    onRemoveFromPlaylist={this.onRemoveFromPlaylist}
                    onDeletePlaylist={this.onDeletePlaylist}
                    onPlaylistFollow={this.onPlaylistFollow}
                    onPlaylistUnfollow={this.onPlaylistUnfollow}
                    onAddToPlaylist={this.onAddToPlaylist}
                    onUpdatePlaylist={this.onUpdatePlaylist}
                    onAddToLibrary={this.onAddToLibrary}
                    onRemoveFromLibrary={this.onRemoveFromLibrary}
                    toggleAddTagPopup={this.toggleAddTagPopup}
                    onTagClick={this.onTagSearch}
                    onRemoveTag={this.onRemoveTag}
                    YT_API_KEY={YT_API_KEY}
                  />}
                />
                <Route exact path='/search' render={({ match }) =>
                  <SearchTags
                    match={match}
                    tagsToSearch={this.state.tagsToSearch}
                    tagsSearchResults={this.state.tagsSearchResults}
                    user={this.state.user}
                    toggleAddTagPopup={this.toggleAddTagPopup}
                    onPlaylistFollow={this.onPlaylistFollow}
                    onRemoveTagSearch={this.onRemoveTagSearch}
                  />}
                />
                <Route exact path='/about' component={About} />
                <Route exact path='/terms' component={Terms} />
                <Route exact path='/privacy' component={Privacy} />
              </Switch>
            </StyledMainContainer>
          </StyledMain>
          <PlayerControls
            playPreviousVideo={this.playPreviousVideo}
            playPreviousSearchVideo={this.playPreviousSearchVideo}
            togglePlay={this.togglePlay}
            playNextVideo={this.playNextVideo}
            playNextSearchVideo={this.playNextSearchVideo}
            playerIsPlaying={this.state.playerIsPlaying}
            playingFromSearch={this.state.playingFromSearch}
            currentPlaylist={this.state.currentPlaylist}
            video={this.state.video}
            videoTitle={this.state.videoTitle}
            videoChannel={this.state.videoChannel}
            progressMax={this.state.progressMax}
            progress={this.state.progress}
            onProgressChange={this.onProgressChange}
            togglePlaylistPopup={this.togglePlaylistPopup}
          />
        </StyledContainer>
        <AddToPlaylistPopup 
          user={this.state.user}
          onLogin={this.onLogin}
          video={this.state.videoToBeAdded}
          open={this.state.playlistPopupIsOpen}
          onAddToPlaylist={this.onAddToPlaylist}
          onAddToLibrary={this.onAddToLibrary}
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
          onImportPlaylist={this.onImportPlaylist}
          onImportFromYoutube={this.onImportFromYoutube}
          playlistName={this.state.playlistName}
          playlistSlug={this.state.playlistSlug}
          selectedPlaylist={this.state.selectedPlaylist}
          addingNewPlaylist={this.state.addingNewPlaylist}
          importingNewPlaylist={this.state.importingNewPlaylist}
          importingType={this.state.importingType}
          playlistUrl={this.state.playlistUrl}
          onImportPlaylistInputChange={this.onImportPlaylistInputChange}
          toggleImportPlaylistPopup={this.toggleImportPlaylistPopup}
        />
        <AddTagsPopup 
          open={this.state.addTagPopupIsOpen}
          onClose={this.toggleAddTagPopup}
          newTag={this.newTag}
          onAddTag={this.onAddTag}
          tagsToSearch={this.state.tagsToSearch}
          isTagSearch={this.state.isTagSearch}
          onAddTagSearch={this.onAddTagSearch}
        />
        <LoginPopup
          user={this.state.user}
          onLogin={this.onLogin}
          open={this.state.loginPopupIsOpen}
          onClose={this.onPlaylistFollow}
        />
        <MuiThemeProvider>
          <Snackbar
            open={this.state.snackIsOpen}
            message={this.state.snackMessage}
            action={this.state.snackAction}
            autoHideDuration={4000}
            onActionTouchTap={() => this.onSnackbarAction(this.state.snackAction)}
            onRequestClose={this.closeSnackbar}
          />
        </MuiThemeProvider>
        <VideoPlayer
          video={this.state.video}
        />
      </div>
    )
  }
}

export default withRouter(App);
