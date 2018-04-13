import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';
import { css } from 'styled-components';
import MaterialIcon from 'material-icons-react';
import VideoItem from './video_item';
import YTApi from './yt_api';
import _ from 'lodash';
import SharePopup from './share_popup';
import VideoListContainer from './video_list_container';

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
  height: calc(100vh - 190px);
  display: flex;
  flex-direction: column;
  ${media.xmedium`
    height: calc(100vh - 100px);
  `}
`;
const StyledHeaderContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  position: relative;
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
  overflow: hidden;
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
`;
const StyledButtonGroup = styled.div`
  display: flex;
`;
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
const StyledPopupContainer = styled.div`
  position: relative;
`;
const StyledOptionsPopup = styled.div`
  position: absolute;
  right: 0px;
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
      scrolling: false,
      reorder: false,

      tagItems: null,

      shareOpen: false,
    };
  };

  componentDidMount() {
    //Get Playlist document basic info
    let docRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId);

    this._unsubscribe = docRef.onSnapshot((doc) => {
      if (doc.exists) {

        let playlistVideos = doc.data().playlistVideos;

        //Copy old videos collection
        if (!playlistVideos) {
          let legacyVideosRef = firebase.firestore().collection('users').doc(this.state.profileId).collection('playlists').doc(this.state.playlistId).collection('videos');

          this._legacyUnsubscribe = legacyVideosRef.onSnapshot(querySnapshot => {
            playlistVideos = [];
            querySnapshot.forEach(function (doc) {
              playlistVideos.push(doc.data());
            });

            if (this.props.user && doc.data().AuthorId === this.props.user.uid) {
              docRef.update({
                playlistVideos,
                videoCount: playlistVideos.length
              });
            }

            this.setState({
              playlist: doc.data(),
              orderBy: doc.data().orderBy,
              orderDirection: doc.data().orderDirection,
              tags: doc.data().tags,
              playlistVideos:  doc.data().orderBy === 'custom'
              ? doc.data().orderDirection === 'asc' ? playlistVideos : playlistVideos.reverse() 
              : _.orderBy(playlistVideos, [doc.data().orderBy], [doc.data().orderDirection]),
            })

          });

          return
        }
        
        //Sort videos
        if (doc.data().orderBy === 'custom' && doc.data().orderDirection === 'desc') {
          playlistVideos = playlistVideos.reverse();
        }
        else if (doc.data().orderBy !== 'custom') {
          playlistVideos = _.orderBy(playlistVideos, [doc.data().orderBy], [doc.data().orderDirection])
        }

        this.setState({
          playlist: doc.data(),
          orderBy: doc.data().orderBy,
          orderDirection: doc.data().orderDirection,
          tags: doc.data().tags,
          playlistVideos: playlistVideos,
        })
      } 
      
      else {

        this.setState({
          playlist: 'not found',
          playlistPublicInfo: 'not found'
        })
        console.log("No such document!");
        
      }
    });

    //Get playlist public Information (followers)
    let publicRef = firebase.firestore().collection('playlists').doc(this.state.playlistId);
    this._publicUnsuscribe = publicRef.onSnapshot((doc) => {
      if (doc.exists) {
        this.setState({
          playlistPublicInfo: doc.data(),
        });
      }
    });
  }

  componentWillUnmount() {
    this._unsubscribe()
    this._publicUnsuscribe()
    if (this._legacyUnsubscribe) this._legacyUnsubscribe()
  }

  componentWillUpdate(nextProps, nextState) {
    //Reorder videos if the current user doesn't owns the playlist
    if (this.state.orderBy !== nextState.orderBy || this.state.orderDirection !== nextState.orderDirection) {
      if (this.props.user && this.state.playlist && this.state.playlist.AuthorId !== this.props.user.uid) {
        this.setState({
          playlistVideos: _.orderBy(nextState.playlistVideos, [nextState.orderBy], [nextState.orderDirection])
        })
      }
    }

    if (this.state.tags !== nextState.tags) {
      //Map tags
      const tagItems = nextState.tags ? nextState.tags.map((tag, i) => { //if tags exist
        const newTags = [...nextState.tags];
        newTags.splice(i, 1);

        //add remove button if user is logged in and owns the playlist      
        const tagRemove = nextProps.user !== null && nextProps.user.uid === nextState.playlist.AuthorId ?
        <StyledButtonTagRemove onClick={() => nextProps.onRemoveTag(newTags, nextState.playlist)}>
          <MaterialIcon icon="clear" color='#fff' size="18px" />
        </StyledButtonTagRemove> : null;
        return (
          <StyledDivTag key= {i}>
            {tagRemove}
            <StyledButtonTagName to={`/tags/${tag}`}>
              {tag}
            </StyledButtonTagName>
          </StyledDivTag>)
      }) : null;

      this.setState({tagItems});
    }
  }

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

  toggleShare = () => {
    this.setState({
      shareOpen: !this.state.shareOpen
    }, () => {
      if (document.getElementById("share-popup") !== null) {
        document.getElementById("share-popup").focus();
      }
    });
  }

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

  onToggleReorder = () => {
    this.setState({reorder: !this.state.reorder})
  }

  onSort = (items) => {
    const docRef = firebase.firestore().collection("users").doc(this.state.profileId).collection("playlists").doc(this.state.playlistId);
    
    const newOrder = _.map(items, item => ({
      timestamp: item.props.video.timestamp,
        videoEtag: item.props.video.videoEtag,
        videoID: item.props.video.videoID,
        videoTitle: item.props.video.videoTitle,
        videoChannel: item.props.video.videoChannel,
        datePublished: item.props.video.datePublished,
        duration: item.props.video.duration,
    }))

    if (this.state.orderDirection === 'desc') newOrder.reverse(); 

    docRef.update({
      playlistVideos: newOrder,
    })
    .then(() => console.log('Order updated'))
    .catch(function(error) {
      console.log(error)
    });
  };

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
    
    //Set tags
    let addTags = null;
    let playlistTags = null;

    //if user is logged in and owns the playlist
    if (this.props.user !== null && this.props.user.uid === playlist.AuthorId) {
      //add button to add tags
      addTags = <StyledButtonTagMore onClick={() => this.props.toggleAddTagPopup(this.state.playlist)}>
        <MaterialIcon icon="add" color='#fff' size="14px" />Add Tag
      </StyledButtonTagMore>

      playlistTags = <StyledPlaylistTags scrolling={this.state.scrolling ? 1 : 0}>
        {this.state.tagItems}
        {addTags}
      </StyledPlaylistTags>
    } 
    //if user doesn't owns the playlist but it has tags
    else if (this.state.tagItems) {
      playlistTags = <StyledPlaylistTags scrolling={this.state.scrolling ? 1 : 0}>
        {this.state.tagItems}
      </StyledPlaylistTags>
    }

    //Set Follow for playlists, related videos and sortable list
    let followButton = null;
    let relatedSection = null;
    let updatePlaylist = null;
    let reorderButton = null;

    if (this.props.user !== null ) {
      if (this.props.user.uid !== playlist.AuthorId) {
        followButton = 
        <PlaylistActions onClick={() => this.props.onPlaylistFollow(playlist, playlistFollowers)}>
          {playlistFollowers} Followers
        </PlaylistActions>

      } else {
        followButton = <PlaylistActionsNone> {playlistFollowers} Followers </PlaylistActionsNone>
        
        relatedSection = <div><StyledRelatedHeader> Related videos </StyledRelatedHeader>
          {this.state.relatedVideoItems}
        </div>

        if (this.state.orderBy === 'custom') {

          if (this.state.reorder) {
            reorderButton = 
            <StyledButton onClick={this.onToggleReorder}>
              <MaterialIcon icon="done" color='#fff' />
            </StyledButton>
          } 
          
          else {
            reorderButton = 
            <StyledButton onClick={this.onToggleReorder}>
              <MaterialIcon icon="format_line_spacing" color='#fff' />
            </StyledButton>
          }
        } 

        if (playlist.spotifyUrl || playlist.youtubeUrl) {
          updatePlaylist = 
          <StyledButtonPopup onClick={() => {this.props.onUpdatePlaylist(playlist, batchSize); this.togglePlaylistsOptions()}}>
            Update Playlist <MaterialIcon icon="cached" color='#fff' />
          </StyledButtonPopup>
        }       
      }

    } else {
      followButton = <PlaylistActionsNone> {playlistFollowers} Followers </PlaylistActionsNone>
    }

    //Set Playlist options popup
    let playlistOptionsPopup = null;
    const arrow = this.state.orderDirection === 'asc' ?  "arrow_downward" : "arrow_upward";

    if (this.state.playlistOptionsIsOpen){
      if (this.props.user !== null && this.props.user.uid === playlist.AuthorId) {
        
        playlistOptionsPopup = 

        <StyledOptionsPopup id="playlist-options-popup" tabIndex="0" onBlur={this.togglePlaylistsOptions} >
          <StyledOptionsLabel>
            Order by <MaterialIcon icon="sort" color='#fff' />
          </StyledOptionsLabel>
          <StyledButtonPopup onClick={() => this.orderBy('custom')}>
            Custom Order 
            <div style={{opacity: this.state.orderBy === 'custom' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('timestamp')}>
            Recently Added 
            <div style={{opacity: this.state.orderBy === 'timestamp' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('datePublished')}>
            Video Date
            <div style={{opacity: this.state.orderBy === 'datePublished' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('videoTitle')}>
            Video Title
            <div style={{opacity: this.state.orderBy === 'videoTitle' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('videoChannel')}>
            Channel
            <div style={{opacity: this.state.orderBy === 'videoChannel' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
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

        <StyledOptionsPopup id="playlist-options-popup" tabIndex="0" onBlur={this.togglePlaylistsOptions} >
          <StyledOptionsLabel>
            Order by <MaterialIcon icon="sort" color='#fff' />
          </StyledOptionsLabel>
          <StyledButtonPopup onClick={() => this.orderBy('timestamp')}>
            Recently Added
            <div style={{opacity: this.state.orderBy === 'timestamp' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('datePublished')}>
            Video Date
            <div style={{opacity: this.state.orderBy === 'datePublished' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('videoTitle')}>
            Video Title
            <div style={{opacity: this.state.orderBy === 'videoTitle' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
          </StyledButtonPopup>
          <StyledButtonPopup onClick={() => this.orderBy('videoChannel')}>
            Channel
            <div style={{opacity: this.state.orderBy === 'videoChannel' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
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
                <StyledButtonGroup>
                  {reorderButton}
                  <StyledButton onClick={this.toggleShare} >
                    <MaterialIcon icon="share" color='#fff' />
                  </StyledButton>
                  <StyledButton onClick={this.togglePlaylistsOptions}><MaterialIcon icon="more_vert" color='#fff' /></StyledButton>
                </StyledButtonGroup>
              </StyledPlaylistActions>
            </StyledHeaderActions>
          </StyledHeader>
        </StyledHeaderContainer>
        <StyledPopupContainer>
          <SharePopup
            open={this.state.shareOpen}
            name={playlistName}
            url={`https://videoplaylists.tv/users/${playlist.AuthorId}/${playlist.playlistId}`}
            onCopy={this.props.setSnackbar}
            onClose={this.toggleShare}
            id="share-popup"
          />
          {playlistOptionsPopup}
        </StyledPopupContainer>
        <VideoListContainer 
          playlistVideos={this.state.playlistVideos}
          user={this.props.user}
          playlist={this.state.playlist}
          libraryVideos={this.props.libraryVideos}
          currentVideoId = {this.props.videoId}
          related={true}

          onSort={this.onSort}
          origin="playlist"

          togglePlayer={this.props.togglePlayer}
          togglePlaylistPopup={this.props.togglePlaylistPopup}
          onAddToPlaylist={this.props.onAddToPlaylist}
          onRemoveFromPlaylist={this.props.onRemoveFromPlaylist}
          onAddToLibrary={this.props.onAddToLibrary}
          onRemoveFromLibrary={this.props.onRemoveFromLibrary}
          orderBy={this.state.orderBy}
          reorder={this.state.reorder}

          setSnackbar={this.props.setSnackbar}
          handleScroll={this.handleScroll}
          YT_API_KEY={this.props.YT_API_KEY}
        />
      </PlaylistContainer>
    )
  };
};

export default Playlist;