import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PlaylistsContainer = styled.div`
  padding: 20px 20px 0;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
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
const PlaylistLink = styled(Link)`
  cursor: pointer;
  color: #fff;
  text-decoration: none;
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

//Tabs

const StyledTabsList = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  flex: 1 0 auto;
  list-style: none;
`
const StyledTabLink = styled(Link)`
  width: 100%;
  font-size: 10px;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 2px;
  font-weight: 400;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 0;
  cursor: pointer;
  color: #fff;
  text-decoration: none;
  ${props => props.selected && `
    font-weight: 700;
    border-bottom: 1px solid white;
  `}
`;
const StyledTabPanel = styled.div`
  overflow-y: auto;
  height: 100%;
`

class Popular extends Component {
  
  render() {

    //Map Popular Playlists
    const popularplaylistItem = this.props.popularPlaylists.map((playlist) => {
      const UserId = this.props.user !== null ? this.props.user.uid : null;
      let followButton = null;
      if (UserId !== playlist.AuthorId) {

        followButton = <PlaylistActions onClick={() => this.props.onPlaylistFollow(playlist, playlist.followers)}>
          {playlist.followers} Followers
      </PlaylistActions>

      } else {

        followButton = <PlaylistActionsNone>
          {playlist.followers} Followers
      </PlaylistActionsNone>

      }

      return (
        <PlaylistItem key={playlist.playlistId}>
          <PlaylistLink to={`/users/${playlist.AuthorId}/${playlist.playlistId}`}>
            <PlaylistTitle>{playlist.playlistName}</PlaylistTitle>
            <PlaylistAuthor>{playlist.Author} | {playlist.videoCount} videos</PlaylistAuthor>
          </PlaylistLink>
          {followButton}
        </PlaylistItem>
      )

    })
    
    return (
      <PlaylistsContainer>
        <h1>Discover</h1>
        <StyledTabsList>
          <StyledTabLink to="/" >Featured</StyledTabLink>
          <StyledTabLink to="/popular" selected >Popular</StyledTabLink>
          <StyledTabLink to="/recent" >Recent</StyledTabLink>
        </StyledTabsList>
        <StyledTabPanel>
          {popularplaylistItem}
        </StyledTabPanel>
      </PlaylistsContainer>
    );
  }
}

export default Popular;