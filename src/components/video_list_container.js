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

const StyledScrollContainer = styled.div`
  width: 100%;
  overflow: hidden;
  height: 100%;
`;
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
      //Sortable component
      sortableComponent: null,
    }
  }

  componentWillMount() {
    this.mapVideoItems(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.playlistVideos !== this.props.playlistVideos 
        || this.props.libraryVideos !== nextProps.libraryVideos
        || this.props.reorder !== nextProps.reorder) {

      this.mapVideoItems(nextProps)
    }

    if (!isEmpty(nextProps.relatedVideos) && nextProps.relatedVideos !== this.props.relatedVideos 
        || this.props.libraryVideos !== nextProps.libraryVideos) {

      this.mapRelatedVideoItems(nextProps)
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.videoItems !== this.state.videoItems
    || nextState.relatedVideos !== this.state.relatedVideos
    || nextProps.reorder !== this.props.reorder) {
      const sortableComponent =
      nextProps.reorder
      ? <SortableComponent
          videoItems={this.state.videoItems}
          // relatedSection={relatedSection}
          onSort={this.onSort}
          handleScroll={this.props.handleScroll}
        />
      : null

      this.setState({sortableComponent});
    }
  }

  mapVideoItems = (nextProps) => {
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

    this.setState({videoItems});
  }

  mapRelatedVideoItems = (nextProps) => {
    const relatedVideoItems = map(nextProps.relatedVideos, video => (
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

  onSort = (items) => {
    const docRef = firebase.firestore().collection("users").doc(this.props.profileId).collection("playlists").doc(this.props.playlistId);
    
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

  onCloseVideoOptions = () => {
    this.setState({optionsOpen: false});
  }

  toggleShare = (optionsVideo) => {
    this.setState({
      shareOpen: !this.state.shareOpen,
      optionsVideo,
    }, () => {
      if (document.getElementById("share-video-popup") !== null) {
        document.getElementById("share-video-popup").focus();
      }
    });
  }
  
  render() {

    let relatedSection = null;

    if (this.state.related) {
      relatedSection =
      <div>
        <StyledRelatedHeader> Related videos </StyledRelatedHeader>
        {this.state.relatedVideoItems} 
      </div>
    }

    return (
      <StyledScrollContainer>
        <VideoOptionsPopup
          playlist={this.props.playlist}
          open={this.state.optionsOpen}
          video={this.state.optionsVideo}
          remove={this.state.optionsRemove}
          togglePlaylistPopup={this.props.togglePlaylistPopup}
          onRemoveFromPlaylist={this.props.onRemoveFromPlaylist}
          onShare={this.toggleShare}
          onClose={this.onCloseVideoOptions}
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
        {
          !this.props.reorder 
          ?
            <StyledVideoListContainer onScroll={this.props.handleScroll}>
              {this.state.videoItems}
              {!isEmpty(this.state.relatedVideoItems) ? <StyledRelatedHeader> Related videos </StyledRelatedHeader> : null}
              {!isEmpty(this.state.relatedVideoItems) ? this.state.relatedVideoItems : null}
            </StyledVideoListContainer>
          : 
            // <SortableComponent
            //   videoItems={this.state.videoItems}
            //   relatedSection={relatedSection}
            //   onSort={this.onSort}
            //   orderBy={this.props.orderBy}
            //   handleScroll={this.props.handleScroll}
            // />
            this.state.sortableComponent
        }
      </StyledScrollContainer>
    );
  }
}

export default VideoListContainer;