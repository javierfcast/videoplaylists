import React from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';
import includes from 'lodash/includes';

const StyledOptionsPopup = styled.div`
  position: absolute;
  right: 0px;
  width: 220px;
  background: rgba(0,0,0,0.9);
  color: #fff;
  padding: 10px 0;
  z-index: 100;
  hr{
    background: none;
    border: none;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .material-icons{
    margin-right: 10px;
  }
  &:focus{
    outline: none;
  }
`;
const StyledOptionsLabel = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 2px;
`;
const StyledButton = styled.a`
  opacity: .6;
  cursor: pointer;
  transition: all .3s ease;
  display: block;
  &:hover{
    opacity: 1;
  }
`;
const StyledButtonPopup = StyledButton.extend`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 10px 10px 20px;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 2px;
`;

const PlaylistOptionsPopup = ({ open, togglePlaylistsOptions, orderBy, orderDirection, onOrderBy, toggleEditPlaylistPopup, playlist, updatePlaylist, onUpdatePlaylist, editable, onDeletePlaylist, options }) => {

  if (!open) {
    return null;
  }

  const arrow = orderDirection === 'asc' ?  "arrow_downward" : "arrow_upward";

  return(
    <StyledOptionsPopup id="playlist-options-popup" tabIndex="0" onBlur={togglePlaylistsOptions} >
      <StyledOptionsLabel>
        Order by <MaterialIcon icon="sort" color='#fff' />
      </StyledOptionsLabel>
      {
        includes(options, 'custom')
        ? <StyledButtonPopup onClick={() => onOrderBy('custom')}>
            <div style={{opacity: orderBy === 'custom' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
            Custom Order 
          </StyledButtonPopup>
        : null
      }
      {
        includes(options, 'recent')
        ? <StyledButtonPopup onClick={() => onOrderBy('timestamp')}>
            <div style={{opacity: orderBy === 'timestamp' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
            Recently Added 
          </StyledButtonPopup>
        : null
      }
      {
        includes(options, 'date')
        ? <StyledButtonPopup onClick={() => onOrderBy('datePublished')}>
            <div style={{opacity: orderBy === 'datePublished' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
            Video Date
          </StyledButtonPopup>
        : null
      }
      {
        includes(options, 'title')
        ? <StyledButtonPopup onClick={() => onOrderBy('videoTitle')}>
            <div style={{opacity: orderBy === 'videoTitle' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
            Video Title
          </StyledButtonPopup>
        : null
      }
      {
        includes(options, 'channel')
        ? <StyledButtonPopup onClick={() => onOrderBy('videoChannel')}>
            <div style={{opacity: orderBy === 'videoChannel' ? 1 : 0}} >
              <MaterialIcon icon={arrow} color='#fff' size='20px' />
            </div>
            Channel
          </StyledButtonPopup>
        : null
      }
      {
        editable 
        ? <div>
            <hr />
            <StyledButtonPopup onClick={() => toggleEditPlaylistPopup(playlist)}>
              <MaterialIcon icon="edit" color='#fff' />
              Edit Playlist
            </StyledButtonPopup>
            {
              updatePlaylist 
              ? <StyledButtonPopup onClick={() => {onUpdatePlaylist(playlist); togglePlaylistsOptions()}}>
                  <MaterialIcon icon="cached" color='#fff' />
                  Update Playlist
                </StyledButtonPopup> 
              : null
            }
            <StyledButtonPopup onClick={() => onDeletePlaylist(playlist)}>
              <MaterialIcon icon="delete_forever" color='#fff' />
              Delete Playlist
            </StyledButtonPopup>
          </div>
        : null
      }
    </StyledOptionsPopup>
  );
}

export default PlaylistOptionsPopup;