import React from 'react';
import styled from 'styled-components';

const StyledHeaderContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  position: relative;
`;

const PlaylistHeader = ({ back, scrolling, playlist, tags, playlistFollowers, author, type, togglePlaylistsOptions, toggleShare, toggleReorder, onPlaylistFollow, follow, reorder, share }) => {

  //Reorder button
  
  let reorderButton = null;

  if (reorder === true) {
    reorderButton =
    <StyledButton onClick={this.toggleReorder}>
      <MaterialIcon icon="done" color='#fff' />
    </StyledButton>
  }
  else if (reorder === false) {
    reorderButton =
    <StyledButton onClick={this.toggleReorder}>
      <MaterialIcon icon="format_line_spacing" color='#fff' />
    </StyledButton>
  }

  // Follow button

  let followButton = null

  if (follow === true) {
    followButton =
    <PlaylistActions onClick={() => onPlaylistFollow(playlist, playlistFollowers)}>
      {playlistFollowers} Followers
    </PlaylistActions>
  }
  else if (follow === false) {
    followButton =
    <PlaylistActionsNone> {playlistFollowers} Followers </PlaylistActionsNone>
  }

  //Actions group

  const actionsGroup =
  <StyledButtonGroup>
    {reorderButton}
    {share ? <StyledButton onClick={toggleShare} ><MaterialIcon icon="share" color='#fff' /></StyledButton> : null}
    <StyledButton onClick={togglePlaylistsOptions}><MaterialIcon icon="more_vert" color='#fff' /></StyledButton>
  </StyledButtonGroup>

  //Map playlist tags if any

  return(
    <StyledHeaderContainer>
      {back ? <StyledBackButton onClick={() => window.history.back()}><MaterialIcon icon="arrow_back" color='#fff' /></StyledBackButton> : null}
      <StyledHeader scrolling={scrolling ? 1 : 0}>
        {author ? <StyledAuthorLink to={`/users/${playlist.AuthorId}`}>{playlist.Author}'s</StyledAuthorLink> : null}
        <StyledPlaylistName scrolling={scrolling ? 1 : 0}> {playlist.playlistName} </StyledPlaylistName>
        {/* tags */}
        <StyledHeaderActions scrolling={scrolling ? 1 : 0}>
          <StyledPlaylistInfo>
            <StyledLabel scrolling={scrolling ? 1 : 0}>
              {playlist.videoCount} Videos in {type === "playlist" ? "this playlist" : type}
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