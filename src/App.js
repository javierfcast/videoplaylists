import {debounce, isEmpty, filter, every, map, some, head, forEach, uniqBy} from 'lodash';
import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import { keyframes } from 'styled-components';
import YTApi from './components/yt_api';
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
import UserNav from './components/user_nav';
import PlayerControls from './components/player_controls';
import VideoPlayer from './components/video_player';
import EditPlaylistPopup from './components/edit_playlist_popup.js';
import AddToPlaylistPopup from './components/add_to_playlist_popup.js';
import AddTagsPopup from './components/add_tags_popup.js';
import Playlist from './components/playlist';
import Library from './components/library';
import Browse from './components/browse';
import Popular from './components/popular';
import Recent from './components/recent';
import Users from './components/users';
import User from './components/user';
import Video from './components/video';
import LoginPopup from './components/login_popup.js';
import About from './components/about';
import Terms from './components/terms';
import Privacy from './components/privacy';
import SearchTags from './components/search_tags'
import LikedYoutube from './components/liked_youtube';
import VideoOptionsPopup from './components/video_options_popup';
import SharePopup from './components/share_popup';
import UpdatePopup from './components/update_popup';

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
  z-index: 995;
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
  padding-top: 8px;
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
const StyledDraggableRegion = styled.div`
  height: 20px;
  width: 100%;
  position: absolute;
  -webkit-app-region: drag;
  z-index: 9999;
`;


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      updateIsOpen: false,
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
      playlistDescription: '',
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
      snackAction: "",
      //GoogleApi
      gapiReady: false,
      //Video single
      watchId: null,
      //PlayerControls
      playingSource: '',
      optionsOpen: false,
      shareOpen: false,
    }

    this.player = null;

  };

  componentWillMount() {

    //Handle electron events
    window.addEventListener('MediaPlayPause', this.togglePlay);
    window.addEventListener('MediaNextTrack', this.playNextVideo);
    window.addEventListener('MediaPreviousTrack', this.playPreviousVideo);

    //Handle login / logout
    firebase.auth().onAuthStateChanged(user => {
      
      this.setState({ user }, () => {
        this.loadYoutubeApi();
      })

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

    //Check if electron is up to date
    const videoplaylistsRef = firebase.firestore().doc(`videoplaylists/electron`);
    
    videoplaylistsRef.get()
    .then(doc => {
      if (typeof window.sendSync === 'function') {
        const electronVersion = window.sendSync("electronVersion");
        
        if (doc.data().version !== electronVersion) {
          this.setState({updateIsOpen: true});
        }
      }
    })
    .catch(e => {
      console.log(e)
      this.setSnackbar(e.message)
    })

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
        this.changeVideo(true);
      }
      //video playling
      else if (event.data === 1) {
        this.setState({playerIsPlaying: true}, () => {
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
        });
      }
      //video paused
      else if (event.data === 2) {
        this.setState({playerIsPlaying: false});
        clearInterval(updateProgressTimerId)               
        clearInterval(progressTimerId);
      }
    });
    
    document.onmousemove = this.hideInterface
    document.onkeypress = this.hideInterface
    document.onwheel = this.hideInterface

    document.onkeydown = this.shortcuts

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
  
  // Hide inteface after 5 seconds of mouse inactivity
  hideInterface = () => {
    
    if (this.state.playerIsOpen !== false ){

      document.getElementById("interface").classList.remove('hidden');

      clearTimeout(mouseTimeout);

      mouseTimeout = setTimeout( () => {
        if (document.activeElement.nodeName === "INPUT" || document.activeElement.nodeName === "TEXTAREA") return
        document.getElementById("interface").classList.add('hidden');
      }, 5000);

    }
  }

  changeVideo = (isNext = true) => {

    this.setState((prevState) => {

      let nextVideoNumber;
      if (isNext) {
        nextVideoNumber = prevState.currentVideoNumber !== prevState.playlistVideos.length - 1 ? prevState.currentVideoNumber + 1 : 0;
      } else {
        nextVideoNumber = prevState.currentVideoNumber !== 0 ? prevState.currentVideoNumber - 1 : prevState.playlistVideos.length - 1;
      }
      const nextVideo = prevState.playlistVideos[nextVideoNumber];

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

  shortcuts = (e) => {
    //control-command + S
    if ((e.metaKey || e.ctrlKey) && e.keyCode === 83) {
      e.preventDefault();
      if (document.getElementById("search-bar") !== null) {
        document.getElementById("search-bar").focus();
      }
    }

    //control-command + P
    if ((e.metaKey || e.ctrlKey) && e.keyCode === 80) {
      e.preventDefault();
      this.toggleAddPlaylistPopup();
    }

    //spacebar
    if (e.keyCode === 32 && this.state.video) {
      if (document.activeElement.nodeName === "INPUT" || document.activeElement.nodeName === "TEXTAREA") return
      e.preventDefault();
      this.togglePlay();
    }
  }

  toggleInterface = () => {
    this.setState({
      interfaceAlwaysOn: !this.state.interfaceAlwaysOn
    })
  };

  toggleNav = () => {
    this.setState({
      navIsOpen: !this.state.navIsOpen
    });
  };

  onVideoSearch = (searchTerm) => {
    if (searchTerm === ''){
      this.setState({
        searchResults: [],
      })
      return null;
    }

    YTApi.search({ part: 'snippet', key: YT_API_KEY, q: searchTerm, type: 'video', maxResults: 10, })
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
    if (!isEmpty(searchArray)) {
      results = 
      filter(this.state.browsePlaylists, playlist => (
        every(
          map(searchArray, term => (
            some(playlist.tags, tag => {
              const reg = new RegExp(term, 'i');
              return reg.test(tag);
            })
          ))
        )
      ))
    } else {
      results = [];
    }
    
    this.setState({tagsSearchResults: results, tagsToSearch: searchArray});
  };

  loadYoutubeApi = () => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/client.js";

    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey: 'AIzaSyC414ldiHXtTTh6ewYAKNYnK4NYyE8TRrY',
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"],
          clientId: '248783838381-dtt7afrnvc78m1bvf2jo42radgg6inme.apps.googleusercontent.com',
          scope: 'profile https://www.googleapis.com/auth/youtube.readonly'
        })
        .then(() => {
          window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

          this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
        })
      });
    };

    document.body.appendChild(script);
  };

  updateSigninStatus = (isSignedIn) => {
    if (isSignedIn) {
      this.setState({gapiReady: true});

      const idToken = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
      const creds = firebase.auth.GoogleAuthProvider.credential(idToken);

      if (!this.state.user) {
        firebase.auth().signInWithCredential(creds).then((user) => {
            if (user) {
              this.setUser(user)
            }
        });
      }
    }
  };

  onLogin = (source) => {

    let provider = null;

    if (source === 'google'){
      window.gapi.auth2.getAuthInstance().signIn();
      return
      // provider = new firebase.auth.GoogleAuthProvider();
    } else if (source === 'facebook') {
      provider = new firebase.auth.FacebookAuthProvider();
    }

    firebase.auth().signInWithPopup(provider)
    .then((result) => { 
      const user = result.user;
      this.setUser(user)
    })
    .catch((error) => {
      console.log(`Error ${error.code}: ${error.message}`)
      this.setSnackbar(error.message);
    })
  };

  onLogout = () => {
    firebase.auth().signOut()
    .then((result) => {

      window.gapi.auth2.getAuthInstance().signOut();

      this.setState({
        user: null,
        gapiReady: false
      });
      // console.log(`Usuario ha salido`);
    })
    .catch((error) => {
      console.log(`Error ${error.code}: ${error.message}`)
      this.setSnackbar(error.message);
    })
  };

  setUser = (user) => {
    this.setState({
      user: user
    });
    
    const userRef = firebase.firestore().doc(`users/${user.uid}`);
    const self = this;

    userRef.get().then(function (doc) {
      if (doc.exists) {
        userRef.update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
        }).then(() => {
          self.setSnackbar(`Wellcome back!`);
          // console.log(`User updated succesfully`);
        }).catch(function (error) {
          console.log('Got an error:', error);
          self.setSnackbar(error.message);
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
          self.setSnackbar(`Wellcome to VideoPlaylists.tv!`);
          // console.log(`User created succesfully`);
        }).catch(function (error) {
          console.log('Got an error:', error);
          self.setSnackbar(error.message);
        })
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
      self.setSnackbar(error.message);
    });
  };

  // onBrowse = () => {
  //   this.setState({
  //     selectedPlaylist: null,
  //     playlistIsOpen: false,
  //   })
  //   console.log(`Browsing: ${this.state.playlistIsOpen}`)
  // };

  onPlaylistFollow = (playlist, playlistFollowers) => {

    const self = this;
    
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
                transaction.delete(followRef);

                //Update count on public playlists collections
                transaction.update(publicPlaylistsRef, {
                  followers: playlistDoc.data().followers - 1
                });

                self.setSnackbar(`Unfollowed ${playlist.playlistName}`);
              }

              //If the user does not follow the playlist. Follow.
              else {
                transaction.set(followRef, {
                  followedOn: firebase.firestore.FieldValue.serverTimestamp(),
                  playlistId: playlist.playlistId,
                  playlistName: playlist.playlistName,
                  playlistDescription: playlist.playlistDescription || "",
                  playlistSlug: playlist.playlistSlugName,
                  Author: playlist.Author,
                  AuthorId: playlist.AuthorId
                });

                //Update count on public playlists collections
                transaction.update(publicPlaylistsRef, {
                  followers: playlistDoc.data().followers + 1
                });

                self.setSnackbar(`Followed ${playlist.playlistName}`);
              }
            });
          });
      }).then(function() {
          // console.log("Transaction successful");
      }).catch(function(error) {
        console.log("Transaction failed: ", error);
        self.setSnackbar(error.message);
      });
    }
  };

  onPlaylistUnfollow = (playlistId) => {
    const user = this.state.user;
    const self = this;
    const followRef = firebase.firestore().collection("users").doc(user.uid).collection('following').doc(playlistId);
    followRef.get().then((doc) => {
      if (doc.exists) {
        const docRef = firebase.firestore().doc(`users/${user.uid}/following/${playlistId}`);
        docRef.delete().then(() => {
          self.setSnackbar(`Unfollowed playlist.`);
          // console.log("Document successfully deleted!");
          this.props.history.push(`/`);
        }).catch(function (error) {
          console.error("Error removing document: ", error);
          self.setSnackbar(error.message);
        });
      } 
    }).catch(function (error) {
      console.log("Error getting document:", error);
      self.setSnackbar(error.message);
    });
  };

  //Play controls for playlists and search results Methods

  togglePlayer = (video, playlist, playlistVideos, playingSource, watchId) => {

    //Play Selected Video from the playlist
    const videoId = video.videoID;
    const videoTitle = video.videoTitle;
    const videoChannel = video.videoChannel;
    
    this.player.loadVideoById(videoId);

    this.setState({
      playerIsOpen: true,
      playerIsPlaying: true,
      playlistVideos: playlistVideos,
      currentPlaylist: playlist,
      currentVideoNumber: playlistVideos.indexOf(video),
      watchId,
      playingSource,
      video,
      videoId,
      videoTitle,
      videoChannel,
    });

    this.setSnackbar(`Currently playing: ${videoTitle} - from ${playlist.playlistName || `Library`}`);

  };

  // toggleSearchPlayer = (video, playlist) => {
   
  //   //Play Selected Video from the search results
  //   const videoId = video.videoID;
  //   const videoTitle = video.videoTitle;
  //   const videoChannel = video.videoChannel;
    

  //   this.setState((prevState) => {
  //     const index = prevState.searchResults.indexOf(video)
  //     this.player.loadVideoById(videoId);
  //     return {
  //       playerIsOpen: true,
  //       playerIsPlaying: true,
  //       playlist: null,
  //       currentVideoNumber: (index > -1 ) ? index : 0,
  //       playlistVideos: prevState.searchResults,
  //       playingSource: null,
  //       currentPlaylist: playlist,
  //       watchId: null,
  //       video,
  //       videoId,
  //       videoTitle,
  //       videoChannel,
  //     }
  //   });

  //   this.setSnackbar(`Currently playing: ${videoTitle} from Search Results`);
    
  // };

  playNextVideo = () => {

    if (!this.state.video){
      return null;
    }

    this.changeVideo(true);

  };

  playPreviousVideo = () => {

    if (!this.state.video) {
      return null;
    }

    this.changeVideo(false);

  };

  togglePlay = () => {

    if (!this.state.video) {
      return null;
    }

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

  toggleVideoOptions = (close) => {
    this.setState({optionsOpen: close ? false : !this.state.optionsOpen});
  }

  toggleShare = () => {
    this.setState({shareOpen: !this.state.shareOpen});
  }

  onAddToPlaylist = (video, item, autoAdd) => {
    const self = this;

    const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
    const videoId = typeof video.id !== 'undefined' ? video.id.videoId : video.videoID;
    const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
    const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;
    const datePublished = typeof video.snippet !== 'undefined' ? video.snippet.publishedAt : video.datePublished;
    const duration = typeof video.contentDetails !== 'undefined' ? video.contentDetails.duration : video.duration ? video.duration : null;
    const spotifyId = video.spotifyId || null;

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
          spotifyId: spotifyId
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
      self.setSnackbar(error.message);
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
    const spotifyId = video.spotifyId || null;

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
          spotifyId: spotifyId
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
      playlistDescription: '',
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
      playlistDescription: '',
      playlistSlug: '',
      playlistUrl: '',
      editPlaylistPopupIsOpen: toggle
    });
  };

  onAddPlaylist = (playlistName, playlistDescription, playlistUrl, callback) => {
    const user = this.state.user;
    const playlistSlugName = this.slugify(playlistName);
    const self = this;

    const spotifyUrl = typeof playlistUrl === "string" 
      && (/spotify/i).test(playlistUrl) 
      ? playlistUrl 
      : null;

    const youtubeUrl = typeof playlistUrl === "string" 
      && (/youtube/i).test(playlistUrl)
      ? playlistUrl
      : null;

    const docRef = firebase.firestore().collection('users').doc(user.uid).collection('playlists');
    docRef.add({
      createdOn: firebase.firestore.FieldValue.serverTimestamp(),
      playlistName: playlistName,
      [spotifyUrl || youtubeUrl ? "playlistHtml" : "playlistDescription"]: playlistDescription,
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
      // console.log(`Playlist saved with Id: ${docRef.id}`);
      docRef.update({
        playlistId: docRef.id
      })
      const playlistsRef = firebase.firestore().doc(`playlists/${docRef.id}`);
      playlistsRef.set({
        createdOn: firebase.firestore.FieldValue.serverTimestamp(),
        playlistName: playlistName,
        [spotifyUrl || youtubeUrl ? "playlistHtml" : "playlistDescription"]: playlistDescription,
        playlistSlugName: playlistSlugName,
        playlistId: docRef.id,
        Author: user.displayName,
        AuthorId: user.uid,
        videoCount: 0,
        followers: 0,
        featured: false
      }).then(function(){
        if (typeof callback === 'function') callback(docRef.id);
        // console.log(`Playlist saved globally with Id: ${docRef.id}`);
        self.setSnackbar(`Created playlist ${playlistName}`);
      }).catch(function (error){
        console.log('Got an error:', error);
        self.setSnackbar(error.message);
      });
    }).catch(function (error) {
      console.log('Got an error:', error);
      self.setSnackbar(error.message);
    })
    
    if (typeof playlistUrl === "undefined") this.toggleClosePlaylistPopup();
  };

  toggleEditPlaylistPopup = (playlist) => {
    this.setState({
      playlistName: playlist.playlistName,
      playlistDescription: playlist.playlistDescription || playlist.playlistHtml,
      playlistSlug: playlist.playlistSlugName,
      playlistId: playlist.playlistId,
      playlistUrl: playlist.playlistUrl,
      addingNewPlaylist: false,
      importingNewPlaylist: false,
      editPlaylistPopupIsOpen: !this.state.editPlaylistPopupIsOpen
    });
  };

  onEditPlaylist = (playlistName, playlistDescription) => {
    const user = this.state.user;
    const playlistSlugName = this.slugify(playlistName);
    
    //Get Refs to public and user playlists
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${this.state.playlistId}`);
    const playlistRef = firebase.firestore().doc(`playlists/${this.state.playlistId}`);
    
    //Update User Playlist
    docRef.update({
      playlistName: playlistName,
      playlistSlugName: playlistSlugName,
      playlistDescription: playlistDescription,
    }).then(() => {
      this.setState({
        currentPlaylistName: playlistName
      })
      this.setSnackbar('Playlist updated!');
    }).catch(function (error) {
      console.log('Got an error:', error);
      this.setSnackbar(error.message);
    })

    //Update Public Playlists
    playlistRef.update({
      playlistName: playlistName,
      playlistSlugName: playlistSlugName,
      playlistDescription: playlistDescription,
    }).then(() => {
      // console.log('Public Playlist updated!');
    }).catch(function (error) {
      console.log('Got an error:', error);
      this.setSnackbar(error.message);
    })

    this.toggleClosePlaylistPopup();
  };

  batchAdd = (playlistIdRef, items, isUpdate, kind) => {
    let playlistVideos = [];
    const db = firebase.firestore();
    const user = this.state.user;
    const self = this;

    forEach(items, video => {
      if (video) {
        const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
        const videoId = typeof video.id !== 'undefined' ? typeof video.id.videoId !== 'undefined' ? video.id.videoId : video.snippet.resourceId.videoId : video.videoID;
        const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
        const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;
        const datePublished = typeof video.snippet !== 'undefined' ? video.snippet.publishedAt : video.datePublished;
        const duration = typeof video.contentDetails !== 'undefined' ? video.contentDetails.duration : video.duration ? video.duration : null;
        const spotifyId = video.spotifyId || null;

        playlistVideos.push({
          timestamp: new Date(),
          videoEtag: videoEtag,
          videoID: videoId,
          videoTitle: videoTitle,
          videoChannel: videoChannel,
          datePublished: datePublished,
          duration: duration,
          spotifyId: spotifyId
        });
      }
    })

    playlistVideos = uniqBy(playlistVideos, "videoID");

    const userPlaylistRef = db.collection('users').doc(user.uid).collection('playlists').doc(playlistIdRef);
    const publicPlaylistRef = db.collection('playlists').doc(playlistIdRef);

    let playlistItem = {
      videoCount: playlistVideos.length,
    }

    //Add a Spotify or YouTube tag if it's a new playlist
    if (!isUpdate && kind) playlistItem.tags = [kind]

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
    //using Google Apps Script to not expose client secret
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
            promises.push(
              new Promise((resolve, reject) => {
                YTApi.search({ part: 'snippet', key: YT_API_KEY, q: searchTerm, type: 'video', maxResults: 1 })
                .then(res => {
                  head(res).spotifyId = trackObj.track.id
                  resolve(res)
                })
                .catch(e => {
                  reject(e)
                })
              })
            );
          });

          Promise.all(promises)
          .then((results)=> {
            results = results.map(r => head(r));
            if (isUpdate === true) {
              self.batchAdd(playlist.playlistId, results, isUpdate, 'Spotify');
            }
            else {
              self.onAddPlaylist(prevData.name, prevData.description, playlistUrl, (docRefId) => {
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
        self.batchAdd(playlist.playlistId, playlistItems.playlistItems, isUpdate, 'YouTube');
      }
      else {
        self.onAddPlaylist(playlistItems.snippet.title, playlistItems.snippet.description, playlistUrl, (docRefId) => {
          self.batchAdd(docRefId, playlistItems.playlistItems, isUpdate, 'YouTube');
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
        self.setSnackbar(`Removed playlist ${playlist.playlistName}`);
        self.props.history.push(`/users/${user.uid}`);
      }).catch((error) => {
        console.error("Error removing document: ", error);
        self.setSnackbar(error.message);
      });
    }).catch((error) => {
      console.error("Error removing document: ", error);
      self.setSnackbar(error.message);
    });
  }

  onAddTag = (e) => {
    e.preventDefault();

    const user = this.state.user;
    //Capitalize each word
    const newTag = e.target.tagInput.value.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    const self = this;
    
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
            // console.log('Playlist updated!');
          }).catch(function (error) {
            console.log('Got an error:', error);
            self.setSnackbar(error.message);
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
            // console.log('Playlist updated!');
          }).catch(function (error) {
            console.log('Got an error:', error);
            self.setSnackbar(error.message);
          })
        }
      }
    );

    this.toggleAddTagPopup();
  };

  onRemoveTag = (newTags, playlistItem) => {
    const user = this.state.user;
    const self = this;
    
    const docRef = firebase.firestore().collection('users').doc(user.uid).collection('playlists').doc(playlistItem.playlistId);
    const playlistRef = firebase.firestore().collection('playlists').doc(playlistItem.playlistId);

    //Update User Playlist
    docRef.get().then(
      (doc) => {
        if (doc.exists) {          
          docRef.update({
            tags: newTags
          }).then(() => {
            // console.log('Playlist updated!');
          }).catch(function (error) {
            console.log('Got an error:', error);
            self.setSnackbar(error.message);
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
            // console.log('Playlist updated!');
          }).catch(function (error) {
            console.log('Got an error:', error);
            self.setSnackbar(error.message);
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

    return (
      <div>
        <StyledContainer id="interface"
          playerIsOpen={this.state.playerIsOpen}
          interfaceAlwaysOn={this.state.interfaceAlwaysOn}
          interfaceOff={this.state.interfaceOff}
        >
          <StyledDraggableRegion />
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
              <SearchBar onVideoSearch={debounce(searchTerm => this.onVideoSearch(searchTerm), 500)}/>
              <UserNav 
                onLogout={this.onLogout}
                user={this.state.user}
                toggleInterface={this.toggleInterface}
              />
            </StyledMainHeading>
            <StyledMainContainer>
              <SearchResults
                user = {this.state.user}
                searchResults = {this.state.searchResults} 
                videoId={this.state.videoId}
                togglePlayer = {this.togglePlayer}
                togglePlaylistPopup = {this.togglePlaylistPopup}
                libraryVideos={this.state.libraryVideos}
                onAddToLibrary={this.onAddToLibrary}
                onRemoveFromLibrary={this.onRemoveFromLibrary}
                history={this.props.history}
                setSnackbar={this.setSnackbar}
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
                <Route exact path='/popular' render={({ match }) =>
                  <Popular
                    user={this.state.user}
                    browsePlaylists={this.state.browsePlaylists}
                    popularPlaylists={this.state.popularPlaylists}
                    featuredPlaylists={this.state.featuredPlaylists}
                    onPlaylistFollow={this.onPlaylistFollow}
                    followingPlaylists={this.state.followingPlaylists}
                  /> }
                />
                <Route exact path='/recent' render={({ match }) =>
                  <Recent
                    user={this.state.user}
                    browsePlaylists={this.state.browsePlaylists}
                    popularPlaylists={this.state.popularPlaylists}
                    featuredPlaylists={this.state.featuredPlaylists}
                    onPlaylistFollow={this.onPlaylistFollow}
                    followingPlaylists={this.state.followingPlaylists}
                  /> }
                />
                <Route exact path='/watch/:videoId' render={({ match }) =>
                  <Video
                    match={match}
                    history={this.props.history}
                    playerLoaded={this.player}
                    user={this.state.user}
                    YT_API_KEY={YT_API_KEY}
                    playNextVideo={this.playNextVideo}
                    onAddToPlaylist={this.onAddToPlaylist}
                    onRemoveFromPlaylist={this.onRemoveFromPlaylist}
                    onAddToLibrary={this.onAddToLibrary}
                    onRemoveFromLibrary={this.onRemoveFromLibrary}
                    libraryVideos={this.state.libraryVideos}
                    togglePlayer={this.togglePlayer}
                    togglePlaylistPopup={this.togglePlaylistPopup}
                    currentVideo={this.state.video}
                    currentPlaylist={this.state.playlistVideos}
                    videoId={this.state.videoId}
                    watchId={this.state.watchId}
                    setSnackbar={this.setSnackbar}
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
                    setSnackbar={this.setSnackbar}
                  /> }
                />
                <Route exact path='/likedyoutube' render={({ match }) =>
                  <LikedYoutube
                    match={match}
                    user={this.state.user}
                    videoId={this.state.videoId}
                    togglePlayer={this.togglePlayer}
                    libraryVideos={this.state.libraryVideos}
                    onAddToLibrary={this.onAddToLibrary}
                    onRemoveFromLibrary={this.onRemoveFromLibrary}
                    togglePlaylistPopup={this.togglePlaylistPopup}
                    accessToken={this.state.accessToken}
                    YT_API_KEY={YT_API_KEY}
                    gapiReady={this.state.gapiReady}
                    onLogin={this.onLogin}
                    setSnackbar={this.setSnackbar}
                  /> }
                />
                <Route exact path='/users/:profileId/:playlistId' render={({ match }) =>
                  <Playlist
                    match={match}
                    key={window.location.href}
                    user={this.state.user}
                    playlistVideos={this.state.playlistVideos}
                    libraryVideos={this.state.libraryVideos}
                    followingPlaylists={this.state.followingPlaylists}
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
                    setSnackbar={this.setSnackbar}
                  />}
                />
                <Route exact path='/tags/:query?' render={({ match }) =>
                  <SearchTags
                    match={match}
                    tagsToSearch={this.state.tagsToSearch}
                    tagsSearchResults={this.state.tagsSearchResults}
                    user={this.state.user}
                    browsePlaylists={this.state.browsePlaylists}
                    toggleAddTagPopup={this.toggleAddTagPopup}
                    onPlaylistFollow={this.onPlaylistFollow}
                    onRemoveTagSearch={this.onRemoveTagSearch}
                    onTagSearch={this.onTagSearch}
                  />}
                />
                <Route exact path='/about' component={About} />
                <Route exact path='/terms' component={Terms} />
                <Route exact path='/privacy' component={Privacy} />
              </Switch>
            </StyledMainContainer>
          </StyledMain>
          <PlayerControls
            togglePlay={this.togglePlay}
            playPreviousVideo={this.playPreviousVideo}
            playNextVideo={this.playNextVideo}
            playerIsPlaying={this.state.playerIsPlaying}
            currentPlaylist={this.state.currentPlaylist}
            video={this.state.video}
            videoTitle={this.state.videoTitle}
            videoChannel={this.state.videoChannel}
            progressMax={this.state.progressMax}
            progress={this.state.progress}
            onProgressChange={this.onProgressChange}
            togglePlaylistPopup={this.togglePlaylistPopup}
            playingSource={this.state.playingSource}
            toggleVideoOptions={this.toggleVideoOptions}
          />
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
            playlistDescription={this.state.playlistDescription}
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
          <VideoOptionsPopup
            playlist={this.state.currentPlaylist}
            open={this.state.optionsOpen}
            video={this.state.video}
            togglePlaylistPopup={this.togglePlaylistPopup}
            onShare={this.toggleShare}
            onClose={() => this.toggleVideoOptions(true)}
            />
          <SharePopup
            open={this.state.shareOpen}
            name={this.state.videoTitle}
            url={
              !this.state.video || !this.state.video.spotifyId
              ? `https://videoplaylists.tv/watch/${this.state.videoId}` 
              : `https://videoplaylists.tv/watch/${this.state.videoId}/${this.state.video.spotifyId}`
            }
            onCopy={this.setSnackbar}
            onClose={this.toggleShare}
            id="share-video-popup"
            large
          />
          <UpdatePopup 
            open={this.state.updateIsOpen}
            onClose={() => this.setState({updateIsOpen: false})}
            setSnackbar={this.setSnackbar}
          />
        </StyledContainer>
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
