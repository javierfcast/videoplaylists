import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { css } from 'styled-components';
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

//custom components

const SearchContainer = styled.div`
  padding: 20px 20px 0;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;
const StyledHeader = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
`;
const StyledContent = styled.div`
  list-style: none;
  width: 100%;
  overflow-y: auto;
  height: 100%;
`;
const StyledTitle = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;  
  margin-bottom: 6px;
  color: #fff;
  text-decoration: none;
`;
const StyledRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 10px 0;
  overflow-x: auto;
  overflow-y: hidden;
  ${media.xmedium`
    padding-top: 0;
  `}
`;
const StyledTagNameContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  transition: all .3s ease;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  margin-right: 10px;
  margin-bottom: 6px;
`;
const StyledTagNameContainerMore = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  transition: all .3s ease;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 100px;
  margin-right: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  opacity: 0.8;
  &:hover{
    opacity: 1;
    border: 1px solid rgba(255,255,255,1);
  }
`;
const StyledButtonTagAdd = styled.div`
  transition: all .3s ease;
  margin-top: 2px;
  margin-right: 6px;
  opacity: .8;
`;
const StyledButtonTagRemove = styled.a`
  cursor: pointer;
  transition: all .3s ease;
  margin-top: 2px;
  margin-right: 6px;
  opacity: 0.4;
  &:hover{
    opacity: 1;
  }
`;
const StyledTagName = styled.h4`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
  margin-right: 8px;
`;
const StyledTagInfo = styled.div`
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
  margin-top: 10px;
  margin-bottom: 10px;
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
const PlaylistMeta = styled.span`
  display: inline-block;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 20px;
`;
const StyledNotFoundContent = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  h1{
    margin-bottom: 40px;
  }
`;

class searchTags extends Component { 
  render() {
    const toSearch = this.props.tagsToSearch;
    const searchResults = this.props.tagsSearchResults;    

    //basic info
    let title;
    let resultCount = searchResults.length > 0 ? searchResults.length : 0;
    
    if (toSearch.length > 1) {

      title = "Searching tags:";
      resultCount += " playlists for this tags";

    } else {

      title = "Searching tag:";
      resultCount += " playlists for this tag";

    }

    const tagsName = toSearch.map((currTag, i)=> {
      const newTags = toSearch.map((t)=>{return t});
      newTags.splice(i, 1);
      
      return (
        <StyledTagNameContainer key = {i}>
          <StyledButtonTagRemove onClick={() => this.props.onRemoveTagSearch(newTags)}>
            <MaterialIcon icon="clear" color='#fff' size="21px" />
          </StyledButtonTagRemove>
          <StyledTagName> {currTag} </StyledTagName>
        </StyledTagNameContainer>
      )
    });

    //map playlist items
    let playlistItem = null;    
    if (searchResults.length > 0) playlistItem = searchResults.map((playlist) => {

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

      let playlistTags = playlist.tags.toString();
      playlistTags = playlistTags.replace(/,/g, ", ");

      return (
        <PlaylistItem key={playlist.playlistId}>
          <PlaylistLink to={`/users/${playlist.AuthorId}/${playlist.playlistId}`}>
            <PlaylistMeta>{playlist.Author}</PlaylistMeta>
            <PlaylistTitle>{playlist.playlistName}</PlaylistTitle>
            <PlaylistMeta>Tags: {playlistTags} | {playlist.videoCount} videos</PlaylistMeta>
          </PlaylistLink>
          {followButton}
        </PlaylistItem>
      )
    })
    else {
      playlistItem = <StyledNotFoundContent>
        <h1>No playlists found.</h1>
      </StyledNotFoundContent>
    }
    
    if (toSearch.length === 0) {
      playlistItem = <StyledNotFoundContent>
        <h1>Add a tag to start searching.</h1>
      </StyledNotFoundContent>
    }

    return (

        <SearchContainer>
        <StyledHeader>
          <StyledTitle> {title} </StyledTitle>
          <StyledRow>
            {tagsName}
            <StyledTagNameContainerMore onClick = {() => this.props.toggleAddTagPopup(null, true)}>
              <StyledButtonTagAdd>
                <MaterialIcon icon="add" color='#fff' size="21px" />
              </StyledButtonTagAdd>
              <StyledTagName> Add tag </StyledTagName>
            </StyledTagNameContainerMore>
          </StyledRow>
          <StyledTagInfo>
            <StyledLabel>{resultCount}</StyledLabel>
          </StyledTagInfo>
        </StyledHeader>
        <StyledContent>
          {playlistItem}
        </StyledContent>
      </SearchContainer>
    );
  }
}

export default searchTags;