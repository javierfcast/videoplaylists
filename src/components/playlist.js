import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import VideoItem from './video_item';
import YTSearch from './yt_search';
import SortableComponent from './sortable_component';

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
`;
const StyledBackButton = styled.a`
  font-size: 24px;
  margin-right: 10px;
  transition: all .5s ease;
  cursor: pointer;
  display: block;
`;
const StyledHeader = styled.div`
  display: block;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
  transition: all .5s ease-out;
  width: 100%;
  ${props => props.scrolling && `
    height: 60px;
  `}
`;
const StyledPlaylistName = styled.h1`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all .5s ease;
  ${props => props.scrolling && `
    font-size: 24px;
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
const StyledHeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  transition: all .5s ease-out;
  ${media.xmedium`
    flex-direction: row;
  `}
  ${props => props.scrolling && `
    margin-top: -80px;
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
  transition: all .3s;
  ${props => props.scrolling && `
    opacity: 0;
    visibility: hidden;
  `}
`;
const StyledAuthorLink = styled(Link)`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;  
  margin-bottom: 6px;
  color: #fff;
  text-decoration: none;
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
`
const StyledPlaylistTags = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 10px 0;
  overflow-x: auto;
  overflow-y: hidden;
  transition: all .5s;
  ${media.xmedium`
    padding-top: 0;
  `}
  ${props => props.scrolling && `
    opacity: 0;
    visibility: hidden;
  `}
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
const PlaylistActionsNone = styled.span`
  position: relative;
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  padding: 10px;
  padding-left: 0;
  transition: all .3s ease;
  overflow: hidden;
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
const StyledButtonTagMore = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: .8;
  cursor: pointer;
  transition: all .3s ease;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  margin-right: 10px;
  white-space: nowrap;
  &:hover{
    opacity: 1;
    border: 1px solid rgba(255,255,255,1);
  }
`;
const StyledDivTag = styled.div`
  display: flex;
  white-space: nowrap;
  align-items: center;
  justify-content: center;
  opacity: .8;
  cursor: pointer;
  transition: all .3s ease;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  margin-right: 10px;
  height: 35px;
  padding: 0 6px;
  &:hover{
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.2);
  }
`;
const StyledButtonTagRemove = styled.a`
  cursor: pointer;
  transition: all .3s ease;
  margin-top: 1px;
  padding: 9px 0 9px 4px;
  opacity: 0.4;
  &:hover{
    opacity: 1;
  }
`;
const StyledButtonTagName = styled(Link)`
  cursor: pointer;
  transition: all .3s ease;
  font-size: 14px;
  padding: 12px 8px;
  text-decoration: none;
  color: #fff;
`;
const VideoListContainer = styled.ul`
  list-style: none;
  width: 100%;
  overflow-y: auto;
  height: 100%;
`;
const StyledRelatedHeader = styled.h2`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-top: 20px;
  padding-bottom: 10px;
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
      scrolling: false
    };
  };

  componentDidMount() {

    //Get Playlist document basic info
    let docRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId);

    docRef.onSnapshot((doc) => {
      if (doc.exists) {
        this.setState({
          playlist: doc.data(),
          orderBy: doc.data().orderBy,
          orderDirection: doc.data().orderDirection
        })
      } else {
        this.setState({
          playlist: 'not found',
          playlistPublicInfo: 'not found'
        })
        console.log("No such document!");
      }
    });    

    //Get playlist public Information (followers)
    let publicRef = firebase.firestore().collection('playlists').doc(this.state.playlistId);
    publicRef.onSnapshot((doc) => {
      if (doc.exists) {
        this.setState({
          playlistPublicInfo: doc.data(),
        });
      }
    }); 

    //Get tags of the playlist
    let playlistRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId);
    
    playlistRef.onSnapshot(doc => {
      if (doc.exists) {       
        this.setState({
          tags: doc.data().tags
        });
      }
    });
    
    //Get videos inside playlist
    if (!this.state.playlist){
      return null;
    }
    let videosRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId).collection('videos');
    videosRef = videosRef.orderBy(this.state.playlist.orderBy, this.state.playlist.orderDirection);
    
    videosRef.onSnapshot(querySnapshot => {
      const playlistVideos = [];
      querySnapshot.forEach(function (doc) {
        playlistVideos.push(doc.data());
      });
      this.setState({
        playlistVideos: playlistVideos,
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.playlist){
      return null;
    }

    //Get videos and reorder them if order changed.
    if (this.state.orderDirection !== prevState.orderDirection) {
      
      let videosRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId).collection('videos');    
      if (this.state.orderBy === 'custom') {
        this.customOrder();
      }
      else {
        
        videosRef = videosRef.orderBy(this.state.orderBy, this.state.orderDirection);
      
        videosRef.onSnapshot(querySnapshot => {
          const playlistVideos = [];
          querySnapshot.forEach(function (doc) {
            playlistVideos.push(doc.data());
          });
          this.setState({
            playlistVideos: playlistVideos,
          });
        });
      };
    }

    //get related videos 
    if (this.state.playlistVideos !== prevState.playlistVideos) {
      this.getRelated(this.state.playlistVideos, this.state.playlist.playlistName);
    }
  };

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
      .then(function () {
        console.log("Order updated Succesfully");
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });

    }
  }

  customOrder = () => {
    const self = this;
    const playlistRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId); 
    const videosRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId).collection('videos');

    videosRef.onSnapshot(querySnapshot => {

      const playlistVideos = [];

      querySnapshot.forEach(function (doc) {
        playlistVideos.push(doc.data());
      });

      //reorder videos

      playlistRef.get().then(function(doc) {
        //if custom order found
        if (doc.exists && doc.data().customOrder) {
          const newPlaylistVideos = [];
          const newCustomOrder = [];

          doc.data().customOrder.forEach((orderId) => {
            playlistVideos.forEach((video)=> {
              if (orderId === video.videoID) {
                newPlaylistVideos.push(video);
                newCustomOrder.push(orderId);
              };
            });
          });

          //if there are videos with no match
          if (playlistVideos.length !== newPlaylistVideos.length) {
            playlistVideos.forEach((video) => {
              const matches = doc.data().customOrder.some((orderId) => {
                return orderId === video.videoID
              })
              if (!matches) {
                newPlaylistVideos.push(video);
                newCustomOrder.push(video.videoID);
              };
            });
          }

          self.setState({
            playlistVideos: newPlaylistVideos,
            customOrder: doc.data().customOrder
          });
        } 
        //set order if it doesn't have any
        else {
          const order = playlistVideos.map((video) => video.videoID);
          playlistRef.update({customOrder: order}).then(() => {

            console.log(`Order set succesfully`);

            self.setState({
              playlistVideos: playlistVideos,
              customOrder: doc.data().customOrder
            });
            
          }).catch(function (error) {
            console.log('Got an error:', error);
          })
        }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });

    });
  }

  onSort = (items) => {
    const newOrder = items.map(item => item.props.videoId);
    
    if (this.state.customOrder && newOrder.toString() === this.state.customOrder.toString()) return;

    const newPlaylistVideos = [];
    newOrder.forEach((orderId) => {
      this.state.playlistVideos.forEach((video)=> {
        if (orderId === video.videoID) newPlaylistVideos.push(video);
      });
    });

    this.setState(({
      playlistVideos: newPlaylistVideos,
      customOrder: newOrder
    }));

    const playlistRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId);
    playlistRef.update({customOrder: newOrder}).then(() => {
      console.log('Custom order set');
    }).catch(function (error) {
      console.log('Got an error:', error);
    });
  };

  getRelated = (playlistVideos, playlistTitle) => {

    if (playlistVideos.length > 0) {
      const lastVideoID = playlistVideos[playlistVideos.length-1].videoID;
      YTSearch({ part: 'snippet', key: this.props.YT_API_KEY, relatedToVideoId: lastVideoID, type: 'video', maxResults: 5 })
      .then((searchResults)=> {    
        const video = searchResults.map((result, index) => {
          return {
            datePublished: result.snippet.publishedAt,
            order: playlistVideos.length + 1,
            videoChannel: result.snippet.channelTitle,
            videoEtag: result.etag,
            videoID: result.id.videoId,
            videoTitle: result.snippet.title,
            key: result.id.videoId,
            duration: result.contentDetails.duration
          }
        });
        this.setState({
          relatedVideos: video
        })
      });
    }
    
    else {
      YTSearch({ part: 'snippet', key: this.props.YT_API_KEY, q: playlistTitle, type: 'video', maxResults: 5 })
      .then((searchResults)=> {    
        const video = searchResults.map((result, index) => {
          return {
            datePublished: result.snippet.publishedAt,
            order: 1,
            videoChannel: result.snippet.channelTitle,
            videoEtag: result.etag,
            videoID: result.id.videoId,
            videoTitle: result.snippet.title,
            key: result.id.videoId,
            duration: result.contentDetails.duration
          }
        });
        this.setState({
          relatedVideos: video
        })
      });
    }
  };

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

  onHandleScrollChild = (result) => {
    if (result === true && this.state.scrolling !== true) {
      this.setState({
        scrolling: true
      })
      console.log(this.state.scrolling)
    } else if (result === false && this.state.scrolling === true) {
      this.setState({
        scrolling: false
      })
      console.log(this.state.scrolling)
    }
  }

  render() {    
    if (!this.state.playlist || !this.state.playlistPublicInfo) {
      return null;
    }

    if (this.state.playlist === 'not found'){
      
      const originFollowing = window.location.search.split('following=')[1];

      if (originFollowing === 'true'){
        return (
          <PlaylistContainer>
            <StyledNoFoundContent>
              <h1>The Playlist you are looking for no longer exists.</h1>
              <PlaylistActions onClick={() => this.props.onPlaylistUnfollow(this.state.playlistId)}>
                Unfollow
              </PlaylistActions>
            </StyledNoFoundContent>
          </PlaylistContainer>
        )
      } else {
        return (
          <PlaylistContainer>
            <StyledNoFoundContent>
              <h1>The Playlist you are looking for does not exists.</h1>
            </StyledNoFoundContent>
          </PlaylistContainer>
        )
      }
    }

    //Basic constants

    const playlist = this.state.playlist;
    const playlistName = this.state.playlist.playlistName;
    const playlistAuthor = this.state.playlist.Author;
    const playlistFollowers = this.state.playlistPublicInfo.followers;
    const batchSize = this.state.playlistVideos.length;
    
    //Map videos inside playlist
    const videoItems = this.state.playlistVideos.map((video) => {     
      
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
          playlist={this.state.playlist}
          playlistVideos={this.state.playlistVideos}
          currentVideoId = {this.props.videoId}
          inSearchResults={false}
          key={video.videoEtag}
          video={video}
          videoEtag={video.videoEtag}
          videoTitle={video.videoTitle}
          videoId={video.videoID}
          videoChannel={video.videoChannel}
          duration={video.duration}
          datePublished={year + '-' + month + '-' + dt}
          togglePlayer={this.props.togglePlayer}
          togglePlaylistPopup={this.props.togglePlaylistPopup}
          onAddToPlaylist={this.props.onAddToPlaylist}
          onRemoveFromPlaylist={this.props.onRemoveFromPlaylist}
          onAddToLibrary={this.props.onAddToLibrary}
          onRemoveFromLibrary={this.props.onRemoveFromLibrary}
          orderBy={this.state.orderBy}
          itsOnLibrary={itsOnLibrary}
        />
      )
    });

    //Map related videos
    const relatedVideoItems = this.state.relatedVideos.map((video) => { 
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

      return (
        <VideoItem
          user={this.props.user}
          playlist={this.state.playlist}
          playlistVideos={this.state.playlistVideos}
          currentVideoId = {this.props.videoId}
          inSearchResults={false}
          inRelatedVideos={true}
          key={video.videoEtag}
          video={video}
          videoEtag={video.videoEtag}
          videoTitle={video.videoTitle}
          videoId={video.videoID}
          videoChannel={video.videoChannel}
          duration={video.duration}
          datePublished={year + '-' + month + '-' + dt}
          togglePlayer={this.props.togglePlayer}
          togglePlaylistPopup={this.props.togglePlaylistPopup}
          onAddToPlaylist={this.props.onAddToPlaylist}
          onRemoveFromPlaylist={this.props.onRemoveFromPlaylist}
          autoAdd={true}
        />
      )
    });

    //Set tags
    let addTags = null;
    let playlistTags = null;

    //Map tags
    const tagItems = this.state.tags? this.state.tags.map((tag, i) => { //if tags exist
      const newTags = this.state.tags.map((t)=>{return t});
      newTags.splice(i, 1);

      //add remove button if user is logged in and owns the playlist      
      const tagRemove = this.props.user !== null && this.props.user.uid === playlist.AuthorId ?
      <StyledButtonTagRemove onClick={() => this.props.onRemoveTag(newTags, this.state.playlist)}>
        <MaterialIcon icon="clear" color='#fff' size="18px" />
      </StyledButtonTagRemove> : null;
      return (
        <StyledDivTag key= {i}>
          {tagRemove}
          <StyledButtonTagName to="/search"
           onClick={() => this.props.onTagClick([tag])}>
           {tag}
          </StyledButtonTagName>
        </StyledDivTag>)
    }) : null;
    
    //if user is logged in and owns the playlist
    if (this.props.user !== null && this.props.user.uid === playlist.AuthorId) {
      //add button to add tags
      addTags = <StyledButtonTagMore onClick={() => this.props.toggleAddTagPopup(this.state.playlist)}>
        <MaterialIcon icon="add" color='#fff' size="14px" />Add Tag
      </StyledButtonTagMore>

      playlistTags = <StyledPlaylistTags scrolling={this.state.scrolling ? 1 : 0}>
        {tagItems}
        {addTags}
      </StyledPlaylistTags>
    } 
    //if user doesn't owns the playlist but it has tags
    else if (tagItems) {
      playlistTags = <StyledPlaylistTags scrolling={this.state.scrolling ? 1 : 0}>
        {tagItems}
      </StyledPlaylistTags>
    }

    //Set Follow for playlists, related videos and sortable list
    let followButton = null;
    let relatedSection = null;
    let videoContainerComponent = null;
    let updatePlaylist = null;

    if (this.props.user !== null ) {
      if (this.props.user.uid !== playlist.AuthorId) {
        followButton = 
        <PlaylistActions onClick={() => this.props.onPlaylistFollow(playlist, playlistFollowers)}>
          {playlistFollowers} Followers
        </PlaylistActions>

        videoContainerComponent = <VideoListContainer onScroll={this.handleScroll}>
          {videoItems}
          {relatedSection}
        </VideoListContainer>
      } else {
        followButton = <PlaylistActionsNone> {playlistFollowers} Followers </PlaylistActionsNone>
        
        relatedSection = <div><StyledRelatedHeader> Related videos </StyledRelatedHeader>
          {relatedVideoItems}
        </div>

        if (this.state.orderBy === 'custom') {
          videoContainerComponent = <SortableComponent
            videoItems={videoItems}
            relatedSection={relatedSection}
            onSort={this.onSort}
            orderBy={this.state.orderBy}
            onHandleScrollChild={this.onHandleScrollChild}
          />
        } else {
          videoContainerComponent = <VideoListContainer onScroll={this.handleScroll}>
            {videoItems}
            {relatedSection}
          </VideoListContainer>
        }

        if (playlist.spotifyUrl) {
          updatePlaylist = 
          <StyledButtonPopup onClick={() => {this.props.onUpdatePlaylist(playlist, batchSize); this.togglePlaylistsOptions()}}>
            Update Playlist <MaterialIcon icon="cached" color='#fff' />
          </StyledButtonPopup>
        }       
      }

    } else {
      followButton = <PlaylistActionsNone> {playlistFollowers} Followers </PlaylistActionsNone>
      videoContainerComponent = <VideoListContainer onScroll={this.handleScroll}>
        {videoItems}
        {relatedSection}
      </VideoListContainer>
    }

    //Set Playlist options popup
    let playlistOptionsPopup = null;

    if (this.state.playlistOptionsIsOpen){
      if (this.props.user !== null && this.props.user.uid === playlist.AuthorId) {
        
        playlistOptionsPopup = 

        <StyledOptionsPopup id="playlist-options-popup" tabIndex="0" onBlur={ () => this.togglePlaylistsOptions() } >
          <StyledOptionsLabel>
            Order by <MaterialIcon icon="sort" color='#fff' />
          </StyledOptionsLabel>
          <StyledButtonPopup onClick={() => this.orderBy('custom')}>
            Custom Order
          </StyledButtonPopup>
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
          <hr />
          <StyledButtonPopup onClick={() => this.props.toggleEditPlaylistPopup(playlist)}>
            Edit Playlist's Name <MaterialIcon icon="edit" color='#fff' />
          </StyledButtonPopup>
          {updatePlaylist}
          <StyledButtonPopup onClick={() => this.props.onDeletePlaylist(playlist, batchSize)}>
            Delete Playlist <MaterialIcon icon="delete_forever" color='#fff' />
          </StyledButtonPopup>
        </StyledOptionsPopup>

      } else if (this.props.user !== null) {
        playlistOptionsPopup = 

        <StyledOptionsPopup id="playlist-options-popup" tabIndex="0" onBlur={ () => this.togglePlaylistsOptions() } >
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
        <StyledHeaderContainer>
          <StyledBackButton onClick={() => window.history.back()}><MaterialIcon icon="arrow_back" color='#fff' /></StyledBackButton>
          <StyledHeader scrolling={this.state.scrolling ? 1 : 0}>
            <StyledAuthorLink to={`/users/${playlist.AuthorId}`}>{playlistAuthor}'s</StyledAuthorLink>
            <StyledPlaylistName scrolling={this.state.scrolling ? 1 : 0}> {playlistName} </StyledPlaylistName>
            {playlistTags}
            <StyledHeaderActions scrolling={this.state.scrolling ? 1 : 0}>
              <StyledPlaylistInfo>
                <StyledLabel scrolling={this.state.scrolling ? 1 : 0}>{playlist.videoCount} Videos in this playlist</StyledLabel>
              </StyledPlaylistInfo>
              <StyledPlaylistActions>
                {followButton}
                <StyledButton onClick={() => this.togglePlaylistsOptions()}><MaterialIcon icon="more_vert" color='#fff' /></StyledButton>
                {playlistOptionsPopup}
              </StyledPlaylistActions>
            </StyledHeaderActions>
          </StyledHeader>
        </StyledHeaderContainer>
        {videoContainerComponent}
      </PlaylistContainer>
    )
  };
};

export default Playlist;