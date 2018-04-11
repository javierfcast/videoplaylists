import React, { Component } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import some from 'lodash/some';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import firebase from 'firebase';
import '@firebase/firestore';

import YTApi from './yt_api';
import SortableComponent from './sortable_component';
import VideoOptionsPopup from './video_options_popup';
import SharePopup from './share_popup';
import VideoItem from './video_item';

const StyledVideoListContainer = styled.ul`
  list-style: none;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
`;
const StyledRelatedHeader = styled.h2`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-top: 20px;
  padding-bottom: 10px;
`;

class VideoListContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //Video Items
      videoItems: [],
      relatedVideoItems: [],
      //Video's options popup
      optionsOpen: false,
      optionsVideo: {},
      optionsRemove: false,
      //Share popup
      shareOpen: false,
      //Related videos
      related: [],
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.playlistVideos !== this.props.playlistVideos 
        || this.props.libraryVideos !== nextProps.libraryVideos
        || this.props.reorder !== nextProps.reorder) {

      let videoItems = map(nextProps.playlistVideos, video => (
        <VideoItem
          user={nextProps.user}
          playlist={nextProps.playlist}
          playlistVideos={nextProps.playlistVideos}
          currentVideoId = {nextProps.videoId}
          inSearchResults={false}
          key={video.videoEtag}
          video={video}
          videoEtag={video.videoEtag}
          videoTitle={video.videoTitle}
          videoId={video.videoID}
          videoChannel={video.videoChannel}
          duration={video.duration}
          datePublished={moment(video.datePublished).format('YYYY[-]MM[-]DD')}
          togglePlayer={nextProps.togglePlayer}
          togglePlaylistPopup={nextProps.togglePlaylistPopup}
          onAddToPlaylist={nextProps.onAddToPlaylist}
          onRemoveFromPlaylist={nextProps.onRemoveFromPlaylist}
          onAddToLibrary={nextProps.onAddToLibrary}
          onRemoveFromLibrary={nextProps.onRemoveFromLibrary}
          orderBy={nextProps.orderBy}
          itsOnLibrary={some(nextProps.libraryVideos, e => (e.videoID === video.videoID))}
          reorder={nextProps.reorder}
          toggleVideoOptions={this.toggleVideoOptions}
        />
      ));

      if (nextProps.reorder) {
        videoItems = <SortableComponent
          videoItems={videoItems}
          onSort={this.onSort}
          orderBy={nextProps.orderBy}
          handleScroll={nextProps.handleScroll}
        />
      }

      this.setState({videoItems}, this.getRelated);

    }

    if (!isEmpty(nextState.related) && nextState.related !== this.state.related 
        || this.props.libraryVideos !== nextProps.libraryVideos) {
        
      const relatedVideoItems = map(nextState.related, video => (
        <VideoItem
          user={nextProps.user}
          playlist={nextProps.playlist}
          playlistVideos={nextProps.playlistVideos}
          currentVideoId = {nextProps.videoId}
          inSearchResults={false}
          inRelatedVideos={true}
          key={video.videoEtag}
          video={video}
          videoEtag={video.videoEtag}
          videoTitle={video.videoTitle}
          videoId={video.videoID}
          videoChannel={video.videoChannel}
          duration={video.duration}
          datePublished={moment(video.datePublished).format('YYYY[-]MM[-]DD')}
          togglePlayer={nextProps.togglePlayer}
          togglePlaylistPopup={nextProps.togglePlaylistPopup}
          onAddToPlaylist={nextProps.onAddToPlaylist}
          onRemoveFromPlaylist={nextProps.onRemoveFromPlaylist}
          onAddToLibrary={nextProps.onAddToLibrary}
          onRemoveFromLibrary={nextProps.onRemoveFromLibrary}
          autoAdd={true}
          itsOnLibrary={some(nextProps.libraryVideos, e => (e.videoID === video.videoID))}
          toggleVideoOptions={this.toggleVideoOptions}
        />
      ))

      this.setState({relatedVideoItems});
      
    }
  }

  getRelated = () => {

    if (!this.props.getRelated) return

    if (this.props.playlistVideos.length > 0) {
      const lastVideoID = this.props.playlistVideos[this.props.playlistVideos.length-1].videoID;
      YTApi.search({ part: 'snippet', key: this.props.YT_API_KEY, relatedToVideoId: lastVideoID, type: 'video', maxResults: 5 })
      .then((searchResults)=> {   

        const related = map(searchResults, result => ({
          datePublished: result.snippet.publishedAt,
          order: this.props.playlistVideos.length + 1,
          videoChannel: result.snippet.channelTitle,
          videoEtag: result.etag,
          videoID: result.id.videoId,
          videoTitle: result.snippet.title,
          key: result.id.videoId,
          duration: result.contentDetails.duration
        }));

        this.setState({related});
      });
    }
    
    else {
      YTApi.search({ part: 'snippet', key: this.props.YT_API_KEY, q: this.props.playlist.playlistTitle, type: 'video', maxResults: 5 })
      .then((searchResults)=> {

        const related = map(searchResults, result => ({
          datePublished: result.snippet.publishedAt,
            order: 1,
            videoChannel: result.snippet.channelTitle,
            videoEtag: result.etag,
            videoID: result.id.videoId,
            videoTitle: result.snippet.title,
            key: result.id.videoId,
            duration: result.contentDetails.duration
        }));

        this.setState({related});
      });
    }
  };

  onSort = (items) => {
    const docRef = firebase
      .firestore()
      .collection("users")
      .doc(this.props.profileId)
      .collection("playlists")
      .doc(this.props.playlistId);
    
    const newOrder = map(items, item => ({
      timestamp: item.props.video.timestamp,
        videoEtag: item.props.video.videoEtag,
        videoID: item.props.video.videoID,
        videoTitle: item.props.video.videoTitle,
        videoChannel: item.props.video.videoChannel,
        datePublished: item.props.video.datePublished,
        duration: item.props.video.duration,
    }))

    if (this.props.orderDirection === 'desc') newOrder.reverse(); 

    docRef.update({
      playlistVideos: newOrder,
    })
    .then(() => console.log('Order updated'))
    .catch(function(error) {
      console.log(error)
    });
  };

  toggleVideoOptions = (optionsVideo, optionsRemove) => {
    this.setState({
      optionsOpen: !this.state.optionsOpen,
      optionsVideo,
      optionsRemove,
    });
  }

  toggleShare = (optionsVideo) => {
    this.setState({
      shareOpen: !this.state.shareOpen,
      optionsOpen: false,
      optionsVideo,
    }, () => {
      if (document.getElementById("share-video-popup") !== null) {
        document.getElementById("share-video-popup").focus();
      }
    });
  }
  
  render() {
    return (
      <div style={{height: '100%'}}>
        <VideoOptionsPopup
          open={this.state.optionsOpen}
          video={this.state.optionsVideo}
          remove={this.state.optionsRemove}
          togglePlaylistPopup={this.props.togglePlaylistPopup}
          onRemoveFromPlaylist={this.props.onRemoveFromPlaylist}
          onShare={this.toggleShare}
          onClose={this.toggleVideoOptions}
          />
        <SharePopup
          open={this.state.shareOpen}
          name={this.state.optionsVideo.videoTitle}
          url={`https://videoplaylists.tv/watch/${this.state.optionsVideo.videoID}`}
          onCopy={this.props.setSnackbar}
          onClose={this.toggleShare}
          id="share-video-popup"
          center
        />
        <StyledVideoListContainer onScroll={this.props.handleScroll}>
          {this.state.videoItems}
          {this.props.related ? <StyledRelatedHeader> Related videos </StyledRelatedHeader> : null}
          {this.props.related ? this.state.relatedVideoItems : null}
        </StyledVideoListContainer>
      </div>
    );
  }
}

export default VideoListContainer;