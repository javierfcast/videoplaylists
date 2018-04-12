import React, { Component } from 'react';
import {SortableContainer, arrayMove} from 'react-sortable-hoc';
import styled from 'styled-components';
import moment from 'moment';
import some from 'lodash/some';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';
import firebase from 'firebase';
import '@firebase/firestore';

import YTApi from './yt_api';
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

 //React sortable hoc

const SortableList = SortableContainer(({ videoItems, relatedVideoItems, handleScroll}) => {
  return (
    <StyledVideoListContainer onScroll={handleScroll}>
      {videoItems}
      {!isEmpty(relatedVideoItems) ? <StyledRelatedHeader> Related videos </StyledRelatedHeader> : null}
      {!isEmpty(relatedVideoItems) ? relatedVideoItems : null}
    </StyledVideoListContainer>
  );
});

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
      relatedVideos: [],
    }
  }

  componentWillMount() {
    this.mapVideoItems(this.props)
    if (this.props.related) this.getRelatedVideos(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.playlistVideos !== this.props.playlistVideos 
        || this.props.libraryVideos !== nextProps.libraryVideos
        || this.props.reorder !== nextProps.reorder) {

      this.mapVideoItems(nextProps)
      if (nextProps.related) this.getRelatedVideos(nextProps)
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (!isEmpty(nextState.relatedVideos) && nextState.relatedVideos !== this.state.relatedVideos 
    || this.props.libraryVideos !== nextProps.libraryVideos) {
      
      this.mapRelatedVideoItems(nextProps, nextState)
    }
  }

  mapVideoItems = (nextProps) => {
    let videoItems = map(nextProps.playlistVideos, (video, index) => (
      <VideoItem
        user={nextProps.user}
        playlist={nextProps.playlist}
        playlistVideos={nextProps.playlistVideos}
        currentVideoId = {nextProps.videoId}
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
        index={index}
        onShare={this.toggleShare}
        
        origin={nextProps.origin}
      />
    ));

    this.setState({videoItems});
  }

  getRelatedVideos = (nextProps) => {
    if (!isEmpty(nextProps.playlistVideos)) {
      YTApi.search({ part: 'snippet', key: this.props.YT_API_KEY, relatedToVideoId: last(nextProps.playlistVideos).videoID, type: 'video', maxResults: 5 })
      .then((searchResults)=> {   
        
        const relatedVideos = map(searchResults, result => ({
          datePublished: result.snippet.publishedAt,
          order: nextProps.playlistVideos.length + 1,
          videoChannel: result.snippet.channelTitle,
          videoEtag: result.etag,
          videoID: result.id.videoId,
          videoTitle: result.snippet.title,
          key: result.id.videoId,
          duration: result.contentDetails.duration
        }));

        this.setState({relatedVideos});
      });
    }
    
    else {
      YTApi.search({ part: 'snippet', key: this.props.YT_API_KEY, q: nextProps.playlist.playlistName, type: 'video', maxResults: 5 })
      .then((searchResults)=> {

        const relatedVideos = map(searchResults, result => ({
          datePublished: result.snippet.publishedAt,
            order: 1,
            videoChannel: result.snippet.channelTitle,
            videoEtag: result.etag,
            videoID: result.id.videoId,
            videoTitle: result.snippet.title,
            key: result.id.videoId,
            duration: result.contentDetails.duration
        }));

        this.setState({relatedVideos});
      });
    }
  }

  mapRelatedVideoItems = (nextProps, nextState) => {
    const relatedVideoItems = map(nextState.relatedVideos, video => (
      <VideoItem
        user={nextProps.user}
        playlist={nextProps.playlist}
        playlistVideos={nextProps.playlistVideos}
        currentVideoId = {nextProps.videoId}
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

        origin="related"
      />
    ))

    this.setState({relatedVideoItems});
  }

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

  onSortEnd = ({oldIndex, newIndex}) => {
    this.props.onSort(arrayMove(this.state.videoItems, oldIndex, newIndex))

    this.setState({
      videoItems: arrayMove(this.state.videoItems, oldIndex, newIndex),
    });
  };

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
            <SortableList 
              videoItems={this.state.videoItems} 
              relatedVideoItems={this.state.relatedVideoItems} 
              handleScroll={this.props.handleScroll}
              useDragHandle={true}
              onSortEnd={this.onSortEnd}
            />
        }
      </StyledScrollContainer>
    );
  }
}

export default VideoListContainer;