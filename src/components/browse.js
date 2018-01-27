import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import styled from 'styled-components';
import { css } from 'styled-components';

//Import Images
import imgCardi from '../images/featured/featured_cardi.jpg';
import imgArcadeFire from '../images/featured/featured_arcade_fire.jpg';
// import imgDespacito from '../images/featured/featured_despacito.jpg';
import imgOzuna from '../images/featured/featured_ozuna.jpg';
import imgQuavo from '../images/featured/featured_quavo.jpg';

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


const PlaylistsContainer = styled.div`
  padding: 20px;
  width: 100%;
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

//Featured View Classes

const StyledFeaturedContainer = styled.div`
  margin: 0 auto;
  padding-top: 20px;
  padding-bottom: 20px;
`;

const StyledFeaturedHero = styled.div`
  width: 100%;
`;
const StyledFeaturedGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const StyledFeatured = styled(Link)`
  position: relative;
  cursor: pointer;
  text-decoration: none;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all .3s ease;
  display: block;
  width: 100%;
  &:hover{
    border: 1px solid rgba(255,255,255,255.1);
  }
  &.col-33{
    ${media.xmedium`
      width: 50%; 
    `}
    ${media.xlarge`
      width: 33.333%;
    `}
  }
  img{
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .5;
  }
`;
const StyledFeaturedContent = styled.div`
  position: absolute;
  padding: 20px;
  bottom: 0;
  h2{
    font-size: 14px;
    ${media.xmedium`
      font-size: 18px;
    `}
    ${media.xlarge`
      font-size: 24px;
    `}
  }
  span{
    letter-spacing: 2px;
    text-transform: uppercase;
    font-size: 10px;
  }
`;


class Browse extends Component {
  
  render() {

    //Map Featured Playlists
    const featuredplaylistItem = this.props.featuredPlaylists.map((playlist) => {
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

    
    //Map Recent Playlists 
    const playlistItem = this.props.browsePlaylists.map((playlist) => {

      //Set some basic variables for user Id and the follow button 
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
        <Tabs>
          <TabList>
            <Tab>Featured</Tab>
            <Tab>Popular</Tab>
            <Tab>Recent</Tab>
          </TabList>
          <TabPanel>
            <StyledFeaturedContainer>
              <StyledFeaturedHero>
                <StyledFeatured to="/users">
                  <img src={imgCardi} alt="Cardi" />
                  <StyledFeaturedContent>
                    <h2>Pitchfork's best 100 songs of 2017</h2>
                    <span>By Video Playlist</span>
                  </StyledFeaturedContent>
                </StyledFeatured>
              </StyledFeaturedHero>
              <StyledFeaturedGrid>
                <StyledFeatured className="col-33" to="/users">
                  <img src={imgQuavo} alt="Quavo" />
                  <StyledFeaturedContent>
                    <h2>Rap Caviar</h2>
                    <span>By Video Playlist</span>
                  </StyledFeaturedContent>
                </StyledFeatured>
                <StyledFeatured className="col-33" to="/users">
                  <img src={imgOzuna} alt="Ozuna" />
                  <StyledFeaturedContent>
                    <h2>Fiesta Latina</h2>
                    <span>By Video Playlist</span>
                  </StyledFeaturedContent>
                </StyledFeatured>
                <StyledFeatured className="col-33" to="/users">
                  <img src={imgArcadeFire} alt="Arcade Fire" />
                  <StyledFeaturedContent>
                    <h2>Indie Mornings</h2>
                    <span>By Video Playlist</span>
                  </StyledFeaturedContent>
                </StyledFeatured>
              </StyledFeaturedGrid>
            </StyledFeaturedContainer>
          </TabPanel>
          <TabPanel>
            {popularplaylistItem}
          </TabPanel>
          <TabPanel>
            {playlistItem}
          </TabPanel>
        </Tabs>
        
      </PlaylistsContainer>
    );
  }
}

export default Browse;