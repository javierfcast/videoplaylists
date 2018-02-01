import _ from 'lodash';
import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import { keyframes } from 'styled-components';
import YTSearch from './components/yt_search'
import SpotifyWebApi from 'spotify-web-api-js';
import YouTubePlayer from 'youtube-player';
import MaterialIcon from 'material-icons-react';
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
import LoginPopup from './components/login_popup.js';
import About from './components/about';
import Terms from './components/terms';
import Privacy from './components/privacy';
import SearchTags from './components/searchTags'

//Import Reset CSS and Basic Styles for everything
import './style/reset.css';
import './style/style.css';
import playlist from './components/playlist';

//Youtube Data 3 API Key
const YT_API_KEY = 'AIzaSyBCXlTwhpkFImoUbYBJproK1zSIMQ_9gLA';
let progTimeout;
let progressTimerId;

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
      //Add Tag Popup
      addTagPopupIsOpen: false,
      newTag: null,
      playlistToAddTag: null,
      //Tags search
      isTagSearch: false,
      tagsToSearch: [],
      tagsSearchResults: [],
      //Progress bar
      progressMax: 0,
      progress: 0
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

  changeVideo = (isNext=true) => {

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
  }

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
      //video playling
      else if (event.data === 1) {
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
      }
      //video paused
      else if (event.data === 2) {               
        clearInterval(progressTimerId);
      }
    });
    
    //Hide inteface after 5 seconds of mouse inactivity

    // document.onmousemove = () => {

    //   if (this.state.playerIsOpen !== false ){

    //     document.getElementById("interface").classList.remove('hidden');

    //     let mouseTimeout;

    //     clearTimeout(mouseTimeout);

    //     mouseTimeout = setTimeout( () => {
    //       document.getElementById("interface").classList.add('hidden');
    //       console.log('hidding interface after 10 seconds of mouse inactivity');
    //     }, 10000);

    //   }

    // }

  };

  componentDidUpdate(prevProps, prevState){

    // if(this.state.videoId !== prevState.videoId){
    //   this.state.player.loadVideoById(this.state.videoId);
    // }

    if (document.getElementById("input-playlist-popup") !== null) {
      document.getElementById("input-playlist-popup").focus();
    }

    console.log(`Playing from search results? ${this.state.playingFromSearch}`)

    if(this.state.currentPlaylist){
      console.log(`Current Playlist: ${this.state.currentPlaylist.playlistName}`)
    }
  };


//Methods

  toggleInterface = () => {
    this.setState({
      interfaceAlwaysOn: !this.state.interfaceAlwaysOn
    })
    console.log(`Interface Always On?: ${this.state.interfaceAlwaysOn}`)
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

    YTSearch({ part: 'snippet', key: YT_API_KEY, q: searchTerm, type: 'video' })
    .then((searchResults)=> {    
      this.setState({
        searchResults: searchResults
      })
    });
  };

  onAddTagSearch = () => {
    const newTagsToSearch = [];
    if (this.state.tagsToSearch.length > 0) this.state.tagsToSearch.forEach((tag) => newTagsToSearch.push(tag));
    newTagsToSearch.push(this.state.newTag);
    this.onTagSearch(newTagsToSearch);
    this.toggleAddTagPopup();    
  }

  onRemoveTagSearch = (newTagsToSearch) => {
    this.onTagSearch(newTagsToSearch);   
  }

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
  }

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
          userRef.set({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            displayName: user.displayName,
            photoURL: user.photoURL,
            uid: user.uid,
            libraryVideoCount: 0,
            libraryOrderBy: 'timestamp',
            libraryOrderDirection: 'asc',
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
  }

  onPlaylistFollow = (playlist, playlistFollowers) => {
    
    if (this.state.user === null) {

      this.setState({
        loginPopupIsOpen: !this.state.loginPopupIsOpen
      });

    } else {
      
      const user = this.state.user;    

      //Route to User Following Playlist Collection
      const followRef = firebase.firestore().collection("users").doc(user.uid).collection('following').doc(playlist.playlistId);
      followRef.get().then((doc) => {
        
        //Checking if the user is already following the playlist and if they do, Unfollow.
        if (doc.exists) {
          console.log(`Removing Playlist: ${playlist.playlistName}.`)
          const docRef = firebase.firestore().doc(`users/${user.uid}/following/${playlist.playlistId}`);
          docRef.delete().then( () => {
            
            //Update count on public playlists collections
            const playlistsRef = firebase.firestore().doc(`playlists/${playlist.playlistId}`);
            playlistsRef.update({
              followers: playlistFollowers - 1,
            }).then(function () {
              console.log(`Playlist followers updated`);
            }).catch(function (error) {
              console.log('Got an error:', error);
            });

          }).catch(function (error) {
            console.error("Error removing document: ", error);
          });

        //If the user does not follow the playlist. Follow.
        } else {

          console.log(`Following Playlist: ${playlist.playlistName}.`)

          const docRef = firebase.firestore().doc(`users/${user.uid}/following/${playlist.playlistId}`);
          docRef.set({
            followedOn: firebase.firestore.FieldValue.serverTimestamp(),
            playlistId: playlist.playlistId,
            playlistName: playlist.playlistName,
            playlistSlug: playlist.playlistSlugName,
            Author: playlist.Author,
            AuthorId: playlist.AuthorId,
          }, {
              merge: true
            }).then(() => {

              //Update count on public playlists collections
              const playlistsRef = firebase.firestore().doc(`playlists/${playlist.playlistId}`);
              playlistsRef.update({
                followers: playlistFollowers + 1,
              }).then(function () {
                console.log(`Playlist followers updated`);
              }).catch(function (error) {
                console.log('Got an error:', error);
              });

            }).catch(function (error) {
              console.log('Got an error:', error);
            })
        }
      }).catch(function (error) {
        console.log("Error getting document:", error);
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

  togglePlayer = (video, playlist, playlistVideos) => {

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

    console.log(`Currently playing: ${videoTitle} - from Playlist Player`);

  };

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

    const player = this.state.player;

    console.log(`Currently playing: ${videoTitle} - out of ${this.state.searchResults.length} from Search Results Player`);
    
  };

  playNextVideo = (video) => {

    if (!video){
      return null;
    }

    this.changeVideo(true);
    console.log(`The current video number is ${this.state.currentVideoNumber} out of ${this.state.playlistVideos.length}`);

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

  onAddToPlaylist = (video, item) => {

    console.log('adding song');  

    const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
    const videoId = typeof video.id !== 'undefined' ? video.id.videoId : video.videoID;
    const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
    const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;
    const datePublished = typeof video.snippet !== 'undefined' ? video.snippet.publishedAt : video.datePublished;
    const duration = typeof video.contentDetails !== 'undefined' ? video.contentDetails.duration : video.duration ? video.duration : null;

    const user = this.state.user;

    //Add song to playlist
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${item.playlistId}/videos/${videoId}`);
    docRef.set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      videoEtag: videoEtag,
      videoID: videoId,
      videoTitle: videoTitle,
      videoChannel: videoChannel,
      datePublished: datePublished,
      duration: duration,
      order: item.videoCount + 1
    })
    .then(() => {
      console.log(`${videoTitle} added to ${item.playlistName}`);
    })
    .catch(function (error) {
      console.log('Got an error:', error);
    })

    //Increment video count in the user playlist
    const userPlaylistRef = firebase.firestore().doc(`users/${user.uid}/playlists/${item.playlistId}`);
    userPlaylistRef.update({
      videoCount: item.videoCount + 1,
    })
    .then(() => {
      console.log(`User count Incremented`);
    })
    .catch(function (error) {
      console.log('Got an error:', error);
    })

    //Increment video count in the public playlist
    const publicPlaylistRef = firebase.firestore().doc(`playlists/${item.playlistId}`);
    publicPlaylistRef.update({
      videoCount: item.videoCount + 1,
    })
    .then(() => {
      console.log(`Public count Incremented`);
    })
    .catch(function (error) {
      console.log('Got an error:', error);
    })

    this.setState({
      playlistPopupIsOpen: !this.state.playlistPopupIsOpen
    });
  };

  onAddToLibrary = (video) => {

    console.log('adding song');

    const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
    const videoId = typeof video.id !== 'undefined' ? video.id.videoId : video.videoID;
    const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
    const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;
    const datePublished = typeof video.snippet !== 'undefined' ? video.snippet.publishedAt : video.datePublished;

    const user = this.state.user;

    //Add song to playlist
    const docRef = firebase.firestore().doc(`users/${user.uid}/library/${videoId}`);
    docRef.set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      videoEtag: videoEtag,
      videoID: videoId,
      videoTitle: videoTitle,
      videoChannel: videoChannel,
      datePublished: datePublished,
      order: user.libraryVideoCount + 1
    })
      .then(() => {
        console.log(`${videoTitle} added to Library`);
      })
      .catch(function (error) {
        console.log('Got an error:', error);
      })

    //Increment video count in the user library
    const userRef = firebase.firestore().doc(`users/${user.uid}`);
    userRef.update({
      libraryVideoCount: user.libraryVideoCount + 1,
    })
      .then(() => {
        console.log(`User library count Incremented`);
      })
      .catch(function (error) {
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

    docRef.delete().then(() => {
      //Decrement video count in the public playlist
      const userPlaylistRef = firebase.firestore().doc(`playlists/${item.playlistId}`);
      userPlaylistRef.update({
        videoCount: item.videoCount - 1,
      })

      //Decrement video count in the user playlist
      const publicPlaylistRef = firebase.firestore().doc(`users/${user.uid}/playlists/${item.playlistId}`);
      publicPlaylistRef.update({
        videoCount: item.videoCount - 1,
      })
    })
    .then(function() {
      console.log("Document successfully deleted!");
    })
    .catch(function (error) {
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
    this.toggleImportPlaylistPopup();
    this.setState({
      playlistUrl: event.dataTransfer.getData("URL")
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

  toggleImportPlaylistPopup = () => {    
    this.setState({
      addingNewPlaylist: false,
      importingNewPlaylist: true,
      previousPlaylistName: '',
      previousPlaylistSlug: '',
      playlistName: '',
      playlistSlug: '',
      playlistUrl: '',
      editPlaylistPopupIsOpen: !this.state.editPlaylistPopupIsOpen
    });
  };

  onAddPlaylist = (spotifyUrl, callback) => {
    const user = this.state.user;
    spotifyUrl = typeof spotifyUrl === "string"  ? spotifyUrl : null;
    
    console.log(`User id: ${user.uid}`);
    console.log(`playlist name: ${this.state.playlistName}`);
    console.log(`playlist slug: ${this.state.playlistSlug}`);
    const docRef = firebase.firestore().collection('users').doc(user.uid).collection('playlists');
    docRef.add({
      createdOn: firebase.firestore.FieldValue.serverTimestamp(),
      playlistName: this.state.playlistName,
      playlistSlugName: this.state.playlistSlug,
      Author: user.displayName,
      AuthorId: user.uid,
      videoCount: 0,
      followers: 0,
      featured: false,
      orderBy: 'timestamp',
      orderDirection: 'asc',
      spotifyUrl: spotifyUrl
    }).then((docRef) => {
      console.log(`Playlist saved with Id: ${docRef.id}`);
      docRef.update({
        playlistId: docRef.id
      })
      const playlistsRef = firebase.firestore().doc(`playlists/${docRef.id}`);
      playlistsRef.set({
        createdOn: firebase.firestore.FieldValue.serverTimestamp(),
        playlistName: this.state.playlistName,
        playlistSlugName: this.state.playlistSlug,
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
    this.toggleClosePlaylistPopup();
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

  onEditPlaylist = () => {
    const user = this.state.user;
    
    //Get Refs to public and user playlists
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${this.state.playlistId}`);
    const playlistRef = firebase.firestore().doc(`playlists/${this.state.playlistId}`);
    
    //Update User Playlist
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

    //Update Public Playlists
    playlistRef.update({
      playlistName: this.state.playlistName,
      playlistSlugName: this.state.playlistSlug
    }).then(() => {
      console.log('Public Playlist updated!');
    }).catch(function (error) {
      console.log('Got an error:', error);
    })

    this.toggleClosePlaylistPopup();
  };

  onImportPlaylist = () => {
    if (!this.state.playlistUrl.match(/user\/.+playlist\/[^\/|?]+/)) return;

    const userId = this.state.playlistUrl.match(/user.([^\/]+)/);
    const playlistId = this.state.playlistUrl.match(/playlist.([^\/|?]+)/);
    const self = this;
    const user = this.state.user;

    function batchAdd(playlistIdRef, items) {
      const db = firebase.firestore();
      const batch = db.batch();
      let seen = [];
      let count = 0;
      
      items.map((video, index)=> {
        if (video){
          const videoEtag = typeof video.etag !== 'undefined' ? video.etag : video.videoEtag;
          const videoId = typeof video.id !== 'undefined' ? video.id.videoId : video.videoID;
          const videoTitle = typeof video.snippet !== 'undefined' ? video.snippet.title : video.videoTitle;
          const videoChannel = typeof video.snippet !== 'undefined' ? video.snippet.channelTitle : video.videoChannel;
          const datePublished = typeof video.snippet !== 'undefined' ? video.snippet.publishedAt : video.datePublished;
          const duration = typeof video.contentDetails !== 'undefined' ? video.contentDetails.duration : video.duration ? video.duration : null;

          //dont set if video is duplicated
          if (seen.some((id) => id === videoId)) return;
          seen.push(videoId);
          
          const docRef = db.collection('users').doc(user.uid).collection('playlists').doc(playlistIdRef).collection('videos').doc(videoId);
          batch.set(docRef, {
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            videoEtag: videoEtag,
            videoID: videoId,
            videoTitle: videoTitle,
            videoChannel: videoChannel,
            datePublished: datePublished,
            duration: duration,
            order: index
          })
          count++
        }
      })

      const userPlaylistRef = db.collection('users').doc(user.uid).collection('playlists').doc(playlistIdRef);
      const publicPlaylistRef = db.collection('playlists').doc(playlistIdRef);

      batch.update(userPlaylistRef, {
        videoCount: count
      });

      batch.update(publicPlaylistRef, {
        videoCount: count
      });

      batch.commit().then(function () {
        console.log('batch commited');
      }).catch((error) => {
        console.log(error);        
      });
    }

    //Fetch Spotify Web Api token with Google Apps Script
    //Using Google Apps Script to not expose client secret
    const spotifyApi = new SpotifyWebApi();
    const APPS_SCRIPT_TOKEN = "https://script.google.com/macros/s/AKfycbyP2Bj6CatiqmAVm02e2iEizeLM6-hNrKv6sLeaRfvBGPFwD5Wd/exec";

    axios.get(APPS_SCRIPT_TOKEN).then((token)=> {      
      spotifyApi.setAccessToken(token.data.access_token);
      spotifyApi.getPlaylist(userId[1], playlistId[1])
      .then((data)=> {       
        const promises = [];

        data.tracks.items.map((trackObj) => {
          const searchTerm = trackObj.track.name + " " + trackObj.track.artists[0].name;
          promises.push(YTSearch({ part: 'snippet', key: YT_API_KEY, q: searchTerm, type: 'video', maxResults: 1 }));
        });

        Promise.all(promises)
        .then((results)=> {
          self.setState({playlistName: data.name, playlistSlug: self.slugify(data.name)}, ()=> {         
            results = results.map((result) => result[0]);
            self.onAddPlaylist(self.state.playlistUrl, (docRefId) => {
              batchAdd(docRefId, results);
            });
          })
        }).catch((error) => {
          console.log(error);        
        });
      }).catch((error) => {
        console.log(error);        
      });      
    }).catch((error)=> {
      console.log(error);      
    });
  }

  onDeletePlaylist = (playlist, batchSize) => {
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
  };

  onAddTagInputChange = (event) => {
    this.setState({
      newTag: event.target.value
    });
  };

  onAddTag = () => {
    const user = this.state.user;
    //Capitalize each word
    const newTag = this.state.newTag.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    
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
                <Route exact path='/users' component={Users} />
                <Route exact path='/users/:profileId' render={({ match }) =>
                  <User
                    match={match}
                    user={this.state.user}
                    onPlaylistFollow={this.onPlaylistFollow}
                    onPlaylistUnfollow={this.onPlaylistUnfollow}
                  /> } 
                />
                <Route exact path='/users/:profileId/library' render={({ match }) =>
                  <Library
                    match={match}
                    user={this.state.user}
                    browsePlaylists={this.state.browsePlaylists}
                    popularPlaylists={this.state.popularPlaylists}
                    featuredPlaylists={this.state.featuredPlaylists}
                    onPlaylistFollow={this.onPlaylistFollow}
                  /> }
                />
                <Route exact path='/users/:profileId/:playlistId' render={({ match }) =>
                  <Playlist
                    match={match}
                    key={window.location.href}
                    user={this.state.user}
                    playlistVideos={this.state.playlistVideos}
                    videoId={this.state.videoId}
                    togglePlayer={this.togglePlayer}
                    togglePlaylistPopup={this.togglePlaylistPopup}
                    toggleEditPlaylistPopup={this.toggleEditPlaylistPopup}
                    onRemoveFromPlaylist={this.onRemoveFromPlaylist}
                    onDeletePlaylist={this.onDeletePlaylist}
                    onPlaylistFollow={this.onPlaylistFollow}
                    onPlaylistUnfollow={this.onPlaylistUnfollow}
                    toggleAddTagPopup={this.toggleAddTagPopup}
                    onRemoveTag={this.onRemoveTag}
                    YT_API_KEY={YT_API_KEY}
                    onTagClick={this.onTagSearch}
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
          playlistName={this.state.playlistName}
          playlistSlug={this.state.playlistSlug}
          selectedPlaylist={this.state.selectedPlaylist}
          addingNewPlaylist={this.state.addingNewPlaylist}
          importingNewPlaylist={this.state.importingNewPlaylist}
          playlistUrl={this.state.playlistUrl}
          onImportPlaylistInputChange={this.onImportPlaylistInputChange}
        />
        <AddTagsPopup 
          open={this.state.addTagPopupIsOpen}
          onClose={this.toggleAddTagPopup}
          newTag={this.newTag}
          onAddTagInputChange={this.onAddTagInputChange}
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
        <VideoPlayer
          video={this.state.video}
        />
      </div>
    )
  }
}

export default withRouter(App);
