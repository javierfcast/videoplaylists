import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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
`;
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
  transition: all .5s cubic-bezier(0.19, 1, 0.22, 1);
  display: block;
  width: 100%;
  overflow: hidden;
  max-height: 420px;
  &:hover{
    border: 1px solid rgba(255,255,255,255.1);
    img{
      opacity: .9;
      -webkit-filter: blur(5px);
      -moz-filter: blur(5px);
      -o-filter: blur(5px);
      -ms-filter: blur(5px);
      filter: blur(5px);
      transform: scale(1.2);
    }
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
    transition: all .3s ease;
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

    // //Map Featured Playlists
    // const featuredplaylistItem = this.props.featuredPlaylists.map((playlist) => {
    //   const UserId = this.props.user !== null ? this.props.user.uid : null;
    //   let followButton = null;
    //   if (UserId !== playlist.AuthorId) {

    //     followButton = <PlaylistActions onClick={() => this.props.onPlaylistFollow(playlist, playlist.followers)}>
    //       {playlist.followers} Followers
    //     </PlaylistActions>

    //   } else {

    //     followButton = <PlaylistActionsNone>
    //       {playlist.followers} Followers
    //     </PlaylistActionsNone>

    //   }

    //   return (
    //     <PlaylistItem key={playlist.playlistId}>
    //       <PlaylistLink to={`/users/${playlist.AuthorId}/${playlist.playlistId}`}>
    //         <PlaylistTitle>{playlist.playlistName}</PlaylistTitle>
    //         <PlaylistAuthor>{playlist.Author} | {playlist.videoCount} videos</PlaylistAuthor>
    //       </PlaylistLink>
    //       {followButton}
    //     </PlaylistItem>
    //   )

    // })

    return (
      <PlaylistsContainer>
        <h1>Discover</h1>
        <StyledTabsList>
          <StyledTabLink to="/" selected >Featured</StyledTabLink>
          <StyledTabLink to="/popular" >Popular</StyledTabLink>
          <StyledTabLink to="/recent" >Recent</StyledTabLink>
        </StyledTabsList>
        <StyledTabPanel>
          <StyledFeaturedContainer>
            <StyledFeaturedHero>
              <StyledFeatured to="/users/fIvaZ2KO14hWHHMUMChBpJ6LO1N2/ByIKvBLzGDm5ocQWQx37">
                <img src={imgCardi} alt="Cardi" />
                <StyledFeaturedContent>
                  <h2>Pitchfork's 100 best songs of 2017</h2>
                  <span>By Video Playlist</span>
                </StyledFeaturedContent>
              </StyledFeatured>
            </StyledFeaturedHero>
            <StyledFeaturedGrid>
              <StyledFeatured className="col-33" to="/users/fIvaZ2KO14hWHHMUMChBpJ6LO1N2/6ix5h503yWLpliMrLRXN">
                <img src={imgQuavo} alt="Quavo" />
                <StyledFeaturedContent>
                  <h2>Rap Caviar</h2>
                  <span>By Video Playlist</span>
                </StyledFeaturedContent>
              </StyledFeatured>
              <StyledFeatured className="col-33" to="/users/fIvaZ2KO14hWHHMUMChBpJ6LO1N2/oH5YlSYbpBTsZAf67mFa">
                <img src={imgOzuna} alt="Ozuna" />
                <StyledFeaturedContent>
                  <h2>Fiesta Latina</h2>
                  <span>By Video Playlist</span>
                </StyledFeaturedContent>
              </StyledFeatured>
              <StyledFeatured className="col-33" to="/users/fIvaZ2KO14hWHHMUMChBpJ6LO1N2/a5lPRHrVGWVCW5zEocVF">
                <img src={imgArcadeFire} alt="Arcade Fire" />
                <StyledFeaturedContent>
                  <h2>Indie Mornings</h2>
                  <span>By Video Playlist</span>
                </StyledFeaturedContent>
              </StyledFeatured>
            </StyledFeaturedGrid>
          </StyledFeaturedContainer>
        </StyledTabPanel>
      </PlaylistsContainer>
    );
  }
}

export default Browse;