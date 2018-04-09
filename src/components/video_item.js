import React, { Component } from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';
import Moment from 'moment';
import { Link } from 'react-router-dom';

const StyledVideoItem = styled.li`
  padding: 20px 0;
  width: 100%;
  display: flex;
  align-items: center;
  &:hover{
    background: linear-gradient(45deg, rgba(255,255,255,0) 0%,rgba(255,255,255,0.1) 100%);
  }
  &.active{
    background: linear-gradient(45deg, rgba(255,255,255,0) 0%,rgba(255,255,255,0.3) 100%);
    border-bottom: 1px solid #fff;
  }
`;
const StyledContent = styled.div`
  transition: all .3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;
const StyledVideoInfo = styled.a`
  cursor: pointer;
`;
const StyledVideoInfoLink = styled(Link)`
  cursor: pointer;
  text-decoration: none;
  color: #fff;
`;
const VideoItemTitle = styled.span`
  display: block;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
`;
const VideoMeta = styled.span`
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
`;
const StyledActions = styled.div`
  min-width: 110px;
  flex: 0 1 auto;
  text-align: right;
`
const StyledActionButton = styled.a`
  cursor: pointer;
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
  opacity: 0;
  ${StyledVideoItem}:hover & {
    opacity: 1;
  }
  ${StyledVideoItem}.active & {
    opacity: 1;
  }
`;
const StyledDragHandle = styled.span`
  cursor: grab;
  width: 24px;
  margin-right: 12px;
`;
const StyledLibraryButton = styled.a`
  cursor: pointer;
  width: 24px;
  flex: 0 1 auto;
  margin-right: 12px;
`;
const StyledLibraryButtonCheck = styled.a`
  cursor: pointer;
  width: 24px;
  flex: 0 1 auto;
  margin-right: 12px;
  height: 24px;
  overflow: hidden;
  position: relative;
  span{
    transition: all .3s;
    position: absolute;
    top: 0;
  }
  &:hover{
    span:first-child{
      top: -26px;
    }
  }
`

class VideoItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsOpen: false,
      shareOpen: false,
    }
  }
  
  render() {
    const durationFormated = Moment.duration(this.props.duration).asMilliseconds() > 3600000
      ? Moment.utc(Moment.duration(this.props.duration).asMilliseconds()).format("hh:mm:ss")
      : Moment.utc(Moment.duration(this.props.duration).asMilliseconds()).format("mm:ss")
    
    const AuthorId = typeof this.props.playlist !== 'undefined' ? this.props.playlist.AuthorId : null;
    const extraMeta = this.props.duration ? " · Duration: " + durationFormated : null; 
      
    let deleteButton = null;

    let addButton = <StyledActionButton onClick={() => this.props.togglePlaylistPopup(this.props.video)}>
      <MaterialIcon icon="playlist_add" color='#fff' />
    </StyledActionButton>
    if (this.props.autoAdd) addButton = <StyledActionButton onClick={() => this.props.onAddToPlaylist(this.props.video, this.props.playlist, this.props.autoAdd)}>
      <MaterialIcon icon="playlist_add" color='#fff' />
    </StyledActionButton>

    let videoTrigger = null;

    
    if (this.props.fromWatch) {
      videoTrigger = 
        <StyledVideoInfoLink to={`/watch/${this.props.videoId}`}>
          <VideoMeta>{this.props.videoChannel}</VideoMeta>
          <VideoItemTitle>{this.props.videoTitle}</VideoItemTitle>
          <VideoMeta>Published: {this.props.datePublished}{extraMeta}</VideoMeta>
        </StyledVideoInfoLink>
    } else if (this.props.inSearchResults === true) {
      videoTrigger = 
      <StyledVideoInfo onClick={() => this.props.toggleSearchPlayer(this.props.video)}>
          <VideoMeta>{this.props.videoChannel}</VideoMeta>
          <VideoItemTitle>{this.props.videoTitle}</VideoItemTitle>
          <VideoMeta>Published: {this.props.datePublished}{extraMeta}</VideoMeta>
        </StyledVideoInfo>
    } else {
      videoTrigger = 
        <StyledVideoInfo onClick={() => this.props.togglePlayer(this.props.video, this.props.playlist, this.props.playlistVideos)}>
          <VideoMeta>{this.props.videoChannel}</VideoMeta>
          <VideoItemTitle>{this.props.videoTitle}</VideoItemTitle>
          <VideoMeta>Published: {this.props.datePublished}{extraMeta}</VideoMeta>
        </StyledVideoInfo>
    }

    let libraryButton = null;

    //Add to library button
    if (this.props.user !== null) {
      if (this.props.itsOnLibrary === true) {
        libraryButton = 
        <StyledLibraryButtonCheck onClick={() => this.props.onRemoveFromLibrary(this.props.video)}>
          <span>
            <MaterialIcon icon="check" color='#fff' />
            <MaterialIcon icon="close" color='#fff' />
          </span>
        </StyledLibraryButtonCheck>
      }
      else if (this.props.itsOnLibrary === false) {
        libraryButton = 
        <StyledLibraryButton onClick={() => this.props.onAddToLibrary(this.props.video, true)}>
          <MaterialIcon icon="add" color='#fff' />
        </StyledLibraryButton>
      }

    } else {
      libraryButton = 
      <StyledLibraryButton onClick={() => this.props.togglePlaylistPopup(this.props.video)}>
        <MaterialIcon icon="add" color='#fff' />
      </StyledLibraryButton>
    }

    if (this.props.user !== null) {
      if (this.props.inSearchResults === true || this.props.user.uid !== AuthorId || this.props.inRelatedVideos) {
        deleteButton = null
        if (this.props.inLibraryVideos && this.props.orderBy === "custom" && this.props.reorder) {
          libraryButton = <StyledDragHandle><MaterialIcon icon="drag_handle" color='#fff' /></StyledDragHandle>
        }
      } else {
        deleteButton = <StyledActionButton onClick={() => this.props.onRemoveFromPlaylist(this.props.videoId, this.props.playlist)}>
          <MaterialIcon icon="delete_forever" color='#fff' />
        </StyledActionButton>
        
        if (this.props.orderBy === "custom" && this.props.reorder) {
          libraryButton = <StyledDragHandle><MaterialIcon icon="drag_handle" color='#fff' /></StyledDragHandle>
        }
      }
    }


    return(
      <StyledVideoItem className={this.props.currentVideoId === this.props.videoId && 'active'}>
        {libraryButton}
        <StyledContent>
          {videoTrigger}
          <StyledActions>
            {addButton}
            {deleteButton}
          </StyledActions>
        </StyledContent>
      </StyledVideoItem>
    );
  }
}

export default VideoItem;