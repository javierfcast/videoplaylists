import React from 'react';
import styled from 'styled-components';

const StyledPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  padding: 20px;
`;
const StyledContent = styled.div`
  max-width: 480px;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 40px;
  margin: 0 auto;
  background: rgba(0,0,0,0.9);
`;
const StyledTitle = styled.h2`
  margin-bottom: 40px;
  font-size: 18px;
`;
const StyledInput = styled.input`
  border: none;
  border-bottom: 1px solid rgba(255,255,255,.1);
  padding: 10px 0;
  width: 100%;
  font-size: 14px;
  color: #fff;
  background: none;
  transition: all .3s ease;
  &::-webkit-input-placeholder{
    color: rgba(255,255,255,.6);
  }
  &::-moz-placeholder { 
    color: rgba(255,255,255,.6);
  }
  &:-ms-input-placeholder {
    color: rgba(255,255,255,.6);
  }
  &:-moz-placeholder {
    color: rgba(255,255,255,.6);
  }
  &:focus{
    outline: none;
    border-bottom: 1px solid rgba(255,255,255,1);
  }
`;
const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const StyledButton = styled.a`
  margin-left: 10px;
  margin-top: 40px;
  height: 40px;
  line-height: 40px;
  display: inline-block;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0 20px;
  transition: all .3s ease;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;
const StyledButtonSubmit = styled.a`
  margin-left: 10px;
  margin-top: 40px;
  height: 40px;
  line-height: 40px;
  display: inline-block;
  border-radius: 0;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0 20px;
  transition: all .3s ease;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  background: linear-gradient(45deg, rgba(68,70,181,0.6) 0%,rgba(74,0,114,0.8) 100%);
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;

const EditPlaylistPopup = ({ user, open, onClose, slugify, onEditPlaylistInputChange, onImportPlaylistInputChange, onAddPlaylist, onEditPlaylist, onImportPlaylist, playlistName, playlistUrl, playlistSlug, selectedPlaylist, addingNewPlaylist, importingNewPlaylist}) => {

  if (!open) {
    return null;
  }

  let modalTitle = null;
  let callToAction = null;
  if(addingNewPlaylist === true){
    modalTitle = <StyledTitle>Add new playlist</StyledTitle>
    callToAction = <StyledButtonSubmit onClick={onAddPlaylist}>Create</StyledButtonSubmit>
  } else if (importingNewPlaylist === true){
    modalTitle = <StyledTitle>Import a playlist from Spotify</StyledTitle>
    callToAction = <StyledButtonSubmit onClick={onImportPlaylist}>Import</StyledButtonSubmit>
  } else {
    modalTitle = <StyledTitle>Edit playlist</StyledTitle>
    callToAction = <StyledButtonSubmit onClick={onEditPlaylist}>Update</StyledButtonSubmit>
  }

  const editInput = importingNewPlaylist? <StyledInput
    id="input-playlist-popup"
    placeholder="Public Playlist Url"
    type="text"
    value={playlistUrl}
    onChange={onImportPlaylistInputChange}
    min="1"
    required
  /> : <StyledInput
    id="input-playlist-popup"
    placeholder="Playlist Name"
    type="text"
    value={playlistName}
    onChange={onEditPlaylistInputChange}
    min="1"
    required
      
  />;
    // console.log(this.props.user);
    // console.log(this.props.selectedPlaylist);

  return (
    <StyledPopup>
      <StyledContent>
        {modalTitle}
        {editInput}
        <StyledActions>
          <StyledButton onClick={onClose}>
            Cancel
          </StyledButton>
          {callToAction}
        </StyledActions>
      </StyledContent>
    </StyledPopup>
  );

}

export default EditPlaylistPopup;