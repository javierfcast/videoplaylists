import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import styled from 'styled-components';
//import MaterialIcon from 'material-icons-react';

const PlaylistsContainer = styled.div`
  padding: 20px;
  width: 100%;
  ${props => props.hidden && `
    display: none;
  `}
`;
const PlaylistItem = styled.li`
  padding: 20px 0;
  width: 100%;
  transition: all .3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover{
    background: linear-gradient(45deg, rgba(255,255,255,0) 0%,rgba(255,255,255,0.1) 100%);
  }
`;
const PlaylistLink = styled.a`
  cursor: pointer;
`;
const PlaylistTitle = styled.span`
  display: block;
  width: 100%;
  margin-bottom: 10px;
`;
const PlaylistAuthor = styled.span`
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
`;
const PlaylistActions = styled.a`
  position: relative;
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
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
  margin-right: 20px;
  padding: 10px;
  transition: all .3s ease;
  overflow: hidden;
`;

class Browse extends Component {
  
  render() {
    
    //Map Recent Playlists 
    const playlistItem = this.props.browsePlaylists.map((playlist) => {

      //Set some basic variables for user Id and the follow button 
      const UserId = this.props.user !== null ? this.props.user.uid : null;
      let followButton = null;

      if (UserId !== playlist.AuthorId) {

        followButton = <PlaylistActions onClick={() => this.props.onPlaylistFollow(playlist)}>
          {playlist.followers} Followers
        </PlaylistActions>

      } else {
        
        followButton = <PlaylistActionsNone>
          {playlist.followers} Followers
        </PlaylistActionsNone>

      }

      return (
        <PlaylistItem key={playlist.playlistId}>
          <PlaylistLink onClick={() => this.props.onPlaylistSelect(playlist)}>
            <PlaylistTitle>{playlist.playlistName}</PlaylistTitle>
            <PlaylistAuthor>{playlist.Author}</PlaylistAuthor>
          </PlaylistLink>
          {followButton}
        </PlaylistItem>
      )

    })

    //Map Popular Playlists
    const popularplaylistItem = this.props.popularPlaylists.map((playlist) => {
      const UserId = this.props.user !== null ? this.props.user.uid : null;
      let followButton = null;
      if (UserId !== playlist.AuthorId) {

        followButton = <PlaylistActions onClick={() => this.props.onPlaylistFollow(playlist)}>
          {playlist.followers} Followers
        </PlaylistActions>

      } else {

        followButton = <PlaylistActionsNone>
          {playlist.followers} Followers
        </PlaylistActionsNone>

      }

      return (
        <PlaylistItem key={playlist.playlistId}>
          <PlaylistLink onClick={() => this.props.onPlaylistSelect(playlist)}>
            <PlaylistTitle>{playlist.playlistName}</PlaylistTitle>
            <PlaylistAuthor>{playlist.Author}</PlaylistAuthor>
          </PlaylistLink>
          {followButton}
        </PlaylistItem>
      )
      
    })

    //Map Featured Playlists
    const featuredplaylistItem = this.props.featuredPlaylists.map((playlist) => {
      const UserId = this.props.user !== null ? this.props.user.uid : null;
      let followButton = null;
      if (UserId !== playlist.AuthorId) {

        followButton = <PlaylistActions onClick={() => this.props.onPlaylistFollow(playlist)}>
          {playlist.followers} Followers
        </PlaylistActions>

      } else {

        followButton = <PlaylistActionsNone>
          {playlist.followers} Followers
        </PlaylistActionsNone>

      }

      return (
        <PlaylistItem key={playlist.playlistId}>
          <PlaylistLink onClick={() => this.props.onPlaylistSelect(playlist)}>
            <PlaylistTitle>{playlist.playlistName}</PlaylistTitle>
            <PlaylistAuthor>{playlist.Author}</PlaylistAuthor>
          </PlaylistLink>
          {followButton}
        </PlaylistItem>
      )

    })

    return (
      <PlaylistsContainer className={this.props.hidden && 'responsive-hidden'}>
        
        <h1>Discover</h1>
        <Tabs>
          <TabList>
            <Tab>Recent</Tab>
            <Tab>Popular</Tab>
            <Tab>Featured</Tab>
          </TabList>
          <TabPanel>
            {playlistItem}
          </TabPanel>
          <TabPanel>
            {popularplaylistItem}
          </TabPanel>
          <TabPanel>
            {featuredplaylistItem}
          </TabPanel>
        </Tabs>
        
      </PlaylistsContainer>
    );
  }
}

export default Browse;