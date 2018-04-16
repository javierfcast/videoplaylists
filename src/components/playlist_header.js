import React from 'react';
import styled from 'styled-components';
import { css } from 'styled-components';
import {map, filter} from 'lodash';
import { Link } from 'react-router-dom';
import MaterialIcon from 'material-icons-react';

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
const StyledAuthorLink = styled(Link)`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;  
  margin-bottom: 6px;
  color: #fff;
  text-decoration: none;
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
  ${props => props.spaceBetween && `
    justify-content: space-between;
  `}
`;
const StyledPlaylistDescription = styled.p`
  padding-right: 20px;
  margin: 10px 0 20px;
  a {
    color: #fff;
  }
  ${props => props.scrolling && `
    opacity: 0;
    visibility: hidden;
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
const StyledButtonGroup = styled.div`
  display: flex;
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

const PlaylistHeader = ({ owner, back, scrolling, playlist, playlistName, playlistDescription, playlistHtml, tags, playlistFollowers, playlistAuthor, type, togglePlaylistsOptions, toggleShare, onToggleReorder, onPlaylistFollow, follow, reorder, share, onRemoveTag, toggleAddTagPopup }) => {

  //Reorder button
  
  let reorderButton = null;

  if (reorder === true && owner) {
    reorderButton =
    <StyledButton onClick={onToggleReorder}>
      <MaterialIcon icon="done" color='#fff' />
    </StyledButton>
  }
  else if (reorder === false && owner) {
    reorderButton =
    <StyledButton onClick={onToggleReorder}>
      <MaterialIcon icon="format_line_spacing" color='#fff' />
    </StyledButton>
  }

  // Follow button

  let followButton = null

  if (follow) {
    if (!owner) {
      followButton =
      <PlaylistActions onClick={() => onPlaylistFollow(playlist, playlistFollowers)}>
        {playlistFollowers} Followers
      </PlaylistActions>
    }

    else {
      followButton =
      <PlaylistActionsNone> {playlistFollowers} Followers </PlaylistActionsNone>
    }
  }

  //Actions group

  const actionsGroup =
  <StyledButtonGroup>
    {reorderButton}
    {share ? <StyledButton onClick={toggleShare} ><MaterialIcon icon="share" color='#fff' /></StyledButton> : null}
    <StyledButton onClick={togglePlaylistsOptions}><MaterialIcon icon="more_vert" color='#fff' /></StyledButton>
  </StyledButtonGroup>

  //Map playlist tags if any
  const tagItem = tags ? map(tags, (tag, i) => (
    <StyledDivTag key= {i}>
      {owner ? 
        <StyledButtonTagRemove onClick={() => onRemoveTag( filter(tags, t => t !== tag) , playlist)} >
          <MaterialIcon icon="clear" color='#fff' size="18px" />
        </StyledButtonTagRemove> 
      : null}
      <StyledButtonTagName to={`/tags/${tag}`}>
        {tag}
      </StyledButtonTagName>
    </StyledDivTag>
  )) : null;

  //Description
  let description = null;

  if (playlistDescription) {
    description =
    <StyledPlaylistDescription scrolling={scrolling ? 1 : 0}>
      {playlistDescription}
    </StyledPlaylistDescription>
  }
  else if (playlistHtml) {
    description =
    <StyledPlaylistDescription scrolling={scrolling ? 1 : 0} dangerouslySetInnerHTML={{__html: playlistHtml}} />
  }

  return(
    <StyledHeaderContainer>
      {back ? <StyledBackButton onClick={() => window.history.back()}><MaterialIcon icon="arrow_back" color='#fff' /></StyledBackButton> : null}
      <StyledHeader scrolling={scrolling ? 1 : 0}>
        {playlistAuthor ? <StyledAuthorLink to={`/users/${playlist.AuthorId}`}>{playlistAuthor}'s</StyledAuthorLink> : null}
        <StyledPlaylistName scrolling={scrolling ? 1 : 0}>{playlistName}</StyledPlaylistName>
        {description}
        { toggleAddTagPopup ?
          <StyledPlaylistTags scrolling={scrolling ? 1 : 0}>
            {tagItem}
            {owner ?
              <StyledButtonTagMore onClick={() => toggleAddTagPopup(playlist)}>
                <MaterialIcon icon="add" color='#fff' size="14px" />Add Tag
              </StyledButtonTagMore>
            : null}
          </StyledPlaylistTags>
        : null}
        <StyledHeaderActions scrolling={scrolling ? 1 : 0}>
          <StyledPlaylistInfo spaceBetween={followButton === null} >
            <StyledLabel scrolling={scrolling ? 1 : 0}>
              {playlist.videoCount || playlist.libraryVideoCount} Videos in {type === "playlist" ? "this playlist" : type}
            </StyledLabel>
            {followButton !== null ? null : actionsGroup}
          </StyledPlaylistInfo>
          { 
            followButton === null 
            ? null
            : <StyledPlaylistActions>
                {followButton}
                {actionsGroup}
              </StyledPlaylistActions>
          }
        </StyledHeaderActions>
      </StyledHeader>
    </StyledHeaderContainer>
  );
}

export default PlaylistHeader;