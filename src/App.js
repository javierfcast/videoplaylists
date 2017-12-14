import _ from 'lodash';
import React, { Component } from 'react';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import YTSearch from 'youtube-api-search';
import YouTubePlayer from 'youtube-player';
import MaterialIcon from 'material-icons-react';

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
import Browse from './components/browse';

//Import Reset CSS and Basic Styles for everything
import './style/reset.css';
import './style/style.css';

//Youtube Data 3 API Key
const YT_API_KEY = 'AIzaSyBCXlTwhpkFImoUbYBJproK1zSIMQ_9gLA';

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
  display: none;
  height: calc(100vh - 120px);
  ${media.xmedium`
    display: block;
    height: calc(100vh - 60px);
  ` }
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
const StyledDiscover = styled.div`
  width: 100%;
`;
const StyledSidenavTrigger = styled.a`
  display: none;
`;
const StyledDiscoverHeading = styled.div`
  display: flex;
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
      //Sidenav
      myPlaylists: [],
      followingPlaylists: [],
      //Modal States
      modalIsOpen: false,
      //Player States
      playerIsOpen: false,
      playerIsPlaying: false,
      playingFromSearch: false,
      player: null,
      //current Video States
      video: null,
      videoEtag: null,
      videoId: null,
      videoTitle:  null,
      videoChannel: null,
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
      selectedPlaylistPublicInfo: null,
      currentPlaylistName: null,
      playlistVideos: [],
      //Browse
      browsePlaylists: [],
      popularPlaylists: [],
      featuredPlaylists: []
    }

    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);

  };

  componentWillMount() {
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

        //Load Following Playlists
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

  onBrowse = () => {
    this.setState({
      selectedPlaylist: null
    })
    console.log(`Browsing`)
  }

  onPlaylistSelect = (item) => {

    console.log('onPlaylistSelect is executing');
    
    // const docRef = firebase.firestore().doc(`users/${this.state.user.uid}/playlists/${item.playlistSlugName}/videos`);
    let docRef = firebase.firestore().collection('users').doc(item.AuthorId).collection('playlists').doc(item.playlistId).collection('videos');
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

      console.log(`Viewing ${item.playlistName} (${playlistVideos.length})`)

    });


    //Bring Browse Info - Followers and Featured Info on Playlist

    let playlistRef = firebase.firestore().collection('playlists').doc(item.playlistId);
    playlistRef.onSnapshot((doc) => {
      if (doc.exists) {
        const playlistPublicInfo = doc.data();
        this.setState({
          selectedPlaylistPublicInfo: playlistPublicInfo
        });
      }
    }); 
  };

  onPlaylistUnfollow = (item) => {
  };

  onPlaylistFollow = (item) => {
    const user = this.state.user;

    const followRef = firebase.firestore().collection("users").doc(user.uid).collection('following').doc(item.playlistId);
    followRef.get().then((doc) => {
      if (doc.exists) {
        console.log(`Removing Playlist: ${item.playlistName}.`)
        const docRef = firebase.firestore().doc(`users/${user.uid}/following/${item.playlistId}`);
        docRef.delete().then( () => {
          const playlistsRef = firebase.firestore().doc(`playlists/${item.playlistId}`);
          playlistsRef.update({
          followers: item.followers - 1,
          }).then(function () {
            console.log(`Playlist followers updated`);
          }).catch(function (error) {
            console.log('Got an error:', error);
          });
          console.log("Document successfully deleted!");
        }).catch(function (error) {
          console.error("Error removing document: ", error);
        });
      } else {
        console.log(`Following Playlist: ${item.playlistName}.`)
        const docRef = firebase.firestore().doc(`users/${user.uid}/following/${item.playlistId}`);
        docRef.set({
          followedOn: firebase.firestore.FieldValue.serverTimestamp(),
          playlistId: item.playlistId,
          playlistName: item.playlistName,
          playlistSlug: item.playlistSlugName,
          Author: item.Author,
          AuthorId: item.AuthorId,
        }, {
            merge: true
          }).then(() => {
            console.log(`Following Playlist: ${item.playlistName}.`);
            const playlistsRef = firebase.firestore().doc(`playlists/${item.playlistId}`);
            playlistsRef.update({
              followers: item.followers + 1,
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
    
  };

  togglePlayer = (video) => {

    //Play Selected Video from the playlist
    const videoId = video.videoID;
    const videoTitle = video.videoTitle;
    const videoChannel = video.videoChannel;

    //Set the current video being played.
    let currentVideoNumber = this.state.playlistVideos.indexOf(video);
    console.log(`The current video number is ${currentVideoNumber} out of ${this.state.playlistVideos.length}`);

    this.setState({
      playerIsOpen: true,
      playerIsPlaying: true,
      playingFromSearch: false,
      video,
      videoId,
      videoTitle,
      videoChannel,
    });

    const player = this.state.player;

    if ('looping' === 'looping') {
    
      player.on('stateChange', (event) => {
        
        if (event.data === 0) {

          currentVideoNumber = currentVideoNumber !== this.state.playlistVideos.length - 1 ? currentVideoNumber + 1 : 0;

          console.log(`The current video number is ${currentVideoNumber} out of ${this.state.playlistVideos.length}`);

          let nextVideo = this.state.playlistVideos[currentVideoNumber];
          
          this.setState({
            video: nextVideo,
            videoId: nextVideo.videoID,
            videoTitle: nextVideo.videoTitle,
            videoChannel: nextVideo.videoChannel,
          })

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

  toggleSearchPlayer = (video) => {
    console.log('playing search results');
    //Play Selected Video from the playlist
    const videoId = video.id.videoId;
    const videoTitle = video.snippet.title;
    const videoChannel = video.snippet.channelTitle;

    //Set the current video being played.
    let currentVideoNumber = this.state.searchResults.indexOf(video);
    console.log(`The current video number is ${currentVideoNumber} out of ${this.state.searchResults.length}`);

    this.setState({
      playerIsOpen: true,
      playerIsPlaying: true,
      playingFromSearch: true,
      video,
      videoId,
      videoTitle,
      videoChannel,
    });

    const player = this.state.player;

    if ('looping' === 'looping') {

      player.on('stateChange', (event) => {

        if (event.data === 0) {

          currentVideoNumber = currentVideoNumber !== this.state.searchResults.length - 1 ? currentVideoNumber + 1 : 0;

          console.log(`The current video number is ${currentVideoNumber} out of ${this.state.searchResults.length}`);

          let nextVideo = this.state.searchResults[currentVideoNumber];

          this.setState({
            video: nextVideo,
            videoId: nextVideo.id.videoId,
            videoTitle: nextVideo.snippet.title,
            videoChannel: nextVideo.snippet.channelTitle,
          })

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
  }

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

  playNextVideo = (video) => {

    let currentVideoNumber = this.state.playlistVideos.indexOf(video);

    currentVideoNumber = currentVideoNumber !== this.state.playlistVideos.length - 1 ? currentVideoNumber + 1 : 0;

    console.log(`The current video number is ${currentVideoNumber} out of ${this.state.playlistVideos.length}`);

    let nextVideo = this.state.playlistVideos[currentVideoNumber];

    this.setState({
      video: nextVideo,
      videoId: nextVideo.videoID,
      videoTitle: nextVideo.videoTitle,
      videoChannel: nextVideo.videoChannel,
    })

    // this.setState(prevState => ({
    //   previousVideo: this.state.Video,
    //   previousVideoId: this.state.VideoId,
    //   previousVideoTitle: this.state.VideoTitle,
    //   previousVideoChannel: this.state.VideoChannel,
    //   nextVideo: this.state.nextVideo,
    //   nextVideoId: this.state.nextVideoId,
    //   nextVideoTitle: this.state.nextVideoTitle,
    //   nextVideoChannel: this.state.nextVideoChannel,
    // }));

    // this.setState(prevState => ({
    //   video: prevState.video.nextVideo,
    //   videoId: prevState.video.nextVideoId,
    //   videoTitle: prevState.video.nextVideoTitle,
    //   videoChannel: prevState.video.nextVideoChannel,
    // }));

    // console.log(`[Play Next] Currently Playing: ${this.state.videoTitle}`)
    // console.log(`[Play Next] Comming Up Next: ${this.state.nextVideoTitle}`)

  };

  playPreviousVideo = (video) => {

    let currentVideoNumber = this.state.playlistVideos.indexOf(video);

    currentVideoNumber = currentVideoNumber !== 0 ? currentVideoNumber - 1 : this.state.playlistVideos.length - 1;

    console.log(`The current video number is ${currentVideoNumber} out of ${this.state.playlistVideos.length}`);

    let previousVideo = this.state.playlistVideos[currentVideoNumber];

    this.setState({
      video: previousVideo,
      videoId: previousVideo.videoID,
      videoTitle: previousVideo.videoTitle,
      videoChannel: previousVideo.videoChannel,
    })

  };

  playNextSearchVideo = (video) => {

    let currentVideoNumber = this.state.searchResults.indexOf(video);

    currentVideoNumber = currentVideoNumber !== this.state.searchResults.length - 1 ? currentVideoNumber + 1 : 0;

    console.log(`The current video number is ${currentVideoNumber} out of ${this.state.searchResults.length}`);

    let nextVideo = this.state.searchResults[currentVideoNumber];

    this.setState({
      video: nextVideo,
      videoId: nextVideo.id.videoId,
      videoTitle: nextVideo.snippet.title,
      videoChannel: nextVideo.snippet.channelTitle,
    })

  };

  playPreviousSearchVideo = (video) => {

    let currentVideoNumber = this.state.searchResults.indexOf(video);

    currentVideoNumber = currentVideoNumber !== 0 ? currentVideoNumber - 1 : this.state.searchResults.length - 1;

    console.log(`The current video number is ${currentVideoNumber} out of ${this.state.searchResults.length}`);

    let previousVideo = this.state.searchResults[currentVideoNumber];

    this.setState({
      video: previousVideo,
      videoId: previousVideo.id.videoId,
      videoTitle: previousVideo.snippet.title,
      videoChannel: previousVideo.snippet.channelTitle,
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

  onAddToPlaylist = (video, item) => {
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
      order: 0,
    }, {
      merge: true
    }).then(() => {
      console.log(`${videoTitle} added to ${item.playlistName} (${this.state.playlistVideos.length})`);
      
      //Increment video count in the public playlist
      const userPlaylistRef = firebase.firestore().doc(`playlists/${item.playlistId}`);
      userPlaylistRef.update({
        videoCount: item.videoCount + 1,
      })

      //Increment video count in the user playlist
      const publicPlaylistRef = firebase.firestore().doc(`users/${user.uid}/playlists/${item.playlistId}`);
      publicPlaylistRef.update({
        videoCount: item.videoCount + 1,
      })

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

    docRef.delete().then(() => {
      console.log("Document successfully deleted!");

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
      Author: user.displayName,
      AuthorId: user.uid,
      videoCount: 0,
    }).then((docRef) => {
      console.log(`Playlist saved with Id: ${docRef.id}`);
      docRef.update({
        playlistId: docRef.id
      })
      // const playlistsRef = firebase.firestore().collection('playlists');
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
        console.log(`Playlist saved globally with Id: ${docRef.id}`);
      }).catch(function (error){
        console.log('Got an error:', error);
      });
    }).catch(function (error) {
      console.log('Got an error:', error);
    })
    this.toggleClosePlaylistPopup();
  };

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
  }

  onDeletePlaylist = (item, batchSize) => {
    const user = this.state.user;
    const db = firebase.firestore();
    const docRef = db.doc(`users/${user.uid}/playlists/${item.playlistId}`);
    const collectionRef = db.collection('users').doc(user.uid).collection('playlists').doc(item.playlistId).collection('videos');

    let self = this;

    if (batchSize !== 0) {

      const query = collectionRef.orderBy('__name__').limit(batchSize);

      return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
        deletePlaylistDoc(docRef, item, self);
      });
    } else {
      return new Promise((resolve, reject) => {
        deletePlaylistDoc(docRef, item, self);
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

    function deletePlaylistDoc(docRef, item, self) {
      console.log(self);
      docRef.delete().then(() => {
        const playlistsRef = firebase.firestore().doc(`playlists/${docRef.id}`);
        playlistsRef.delete().then(function () {
          console.log(`${docRef.id} Document successfully deleted!`);
          self.setState({
            selectedPlaylist: null,
          });
          console.log('Selected playlist set to null');
        }).catch(function (error) {
          console.error("Error removing document: ", error);
        });
      }).catch(function (error) {
        console.error("Error removing document: ", error);
      });
    };
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
              followingPlaylists={this.state.followingPlaylists}
              onBrowse={this.onBrowse}
              onPlaylistSelect={this.onPlaylistSelect}
              toggleAddPlaylistPopup={this.toggleAddPlaylistPopup}
            />
          </StyledAside>
          <StyledMain>
            <StyledDiscoverHeading>
              <StyledSidenavTrigger>
                <MaterialIcon icon="menu" color='#fff' />
              </StyledSidenavTrigger>
              <SearchBar onVideoSearch={onVideoSearch}/>
            </StyledDiscoverHeading>
            <StyledListsContainer>
              <StyledDiscover>  
                <SearchResults
                  user = {this.state.user}
                  searchResults = {this.state.searchResults} 
                  videoId={this.state.videoId}
                  togglePlayer = {this.togglePlayer}
                  toggleSearchPlayer = {this.toggleSearchPlayer}
                  togglePlaylistPopup = {this.togglePlaylistPopup}
                />
                <Browse
                  user={this.state.user}
                  browsePlaylists={this.state.browsePlaylists}
                  popularPlaylists={this.state.popularPlaylists}
                  featuredPlaylists={this.state.featuredPlaylists}
                  onPlaylistSelect={this.onPlaylistSelect}
                  onPlaylistFollow={this.onPlaylistFollow}
                />
              </StyledDiscover>
              <Playlist 
                user={this.state.user}
                selectedPlaylist={this.state.selectedPlaylist}
                selectedPlaylistPublicInfo={this.state.selectedPlaylistPublicInfo}
                currentPlaylistName={this.state.currentPlaylistName}
                playlistName={this.state.playlistName}
                playlistVideos={this.state.playlistVideos}
                videoId={this.state.videoId}
                togglePlayer={this.togglePlayer}
                togglePlaylistPopup={this.togglePlaylistPopup}
                toggleEditPlaylistPopup={this.toggleEditPlaylistPopup}
                onRemoveFromPlaylist={this.onRemoveFromPlaylist}
                onDeletePlaylist={this.onDeletePlaylist}
                onPlaylistFollow={this.onPlaylistFollow}
              />
            </StyledListsContainer>
          </StyledMain>
          <PlayerControls
            playPreviousVideo={this.playPreviousVideo}
            playPreviousSearchVideo={this.playPreviousSearchVideo}
            togglePlay={this.togglePlay}
            playNextVideo={this.playNextVideo}
            playNextSearchVideo={this.playNextSearchVideo}
            playerIsPlaying={this.state.playerIsPlaying}
            playingFromSearch={this.state.playingFromSearch}
            video={this.state.video}
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
