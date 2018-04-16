import React from 'react';
import styled from 'styled-components';
import { css } from 'styled-components';

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

const StyledPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  padding: 20px;
`;
const StyledContainer = styled.div`
  max-width: 480px;
  border: 1px solid rgba(255,255,255,0.1);
  margin: 0 auto;
  background: rgba(0,0,0,0.9);
  position: relative;
`;
const StyledContent = styled.form`
  padding: 40px;
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
const StyledTextArea = styled.textarea`
  border: none;
  border-bottom: 1px solid rgba(255,255,255,.1);
  padding: 10px 0;
  width: 100%;
  font-size: 14px;
  color: #fff;
  background: none;
  transition: all .3s ease;
  resize: vertical;
  margin-top: 20px;
  max-height: 176px;
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
const StyledButtonSubmit = styled.button`
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
  &:focus{
    outline: none;
  }
`;
const StyledSeparator = styled.div`
  position: relative;
  text-align: center;
  font-weight: 100;
  &:before{
    border-top: 1px solid rgba(255,255,255,0.1);
    content: "";
    height: 1px;
    left: auto;
    right: 0;
    position: absolute;
    top: 50%;
    width: 40%;
    z-index: 0;    
  }
  &:after{
    border-top: 1px solid rgba(255,255,255,0.1);
    content: "";
    height: 1px;
    left: 0;
    position: absolute;
    top: 50%;
    width: 40%;
    z-index: 0;    
  }
`;
const StyledOptionsActions = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  ${media.xmedium`
    flex-direction: row;
  `}
`;
const StyledOptionsButton = styled.a`
  width: 100%;
  margin: 10px 0;
  height: 40px;
  line-height: 40px;
  display: inline-block;
  text-align: center;
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
  ${media.xmedium`
    margin: 0 10px;
  `}
`;

const EditPlaylistPopup = ({ user, open, onClose, slugify, onEditPlaylistInputChange, onImportPlaylistInputChange, onAddPlaylist, onEditPlaylist, onImportPlaylist, onImportFromYoutube, playlistName, playlistDescription, playlistUrl, playlistSlug, selectedPlaylist, addingNewPlaylist, importingNewPlaylist, importingType, toggleImportPlaylistPopup, onImportPlaylistDrop}) => {

  if (!open) {
    return null;
  }

  let modalTitle = null;
  let callToAction = null;
  let textInput = null;
  let formAction = null;

  let separator = <StyledSeparator>Or Import</StyledSeparator>;

  let options =
    <StyledContent>
      <StyledOptionsActions>
        <StyledOptionsButton 
          onClick={() => toggleImportPlaylistPopup('Spotify', true)}
          onDrop={(event) => {onImportPlaylistDrop(event)}}
          onDragOver={(e) => e.preventDefault()}>
          From Spotify
        </StyledOptionsButton>
        <StyledOptionsButton 
          onClick={() => toggleImportPlaylistPopup('YouTube', true)}>
          From YouTube
        </StyledOptionsButton>
      </StyledOptionsActions>
    </StyledContent>;

  let textArea = 
    <StyledTextArea
      name="playlistDescription"
      placeholder="Playlist Description"
      rows="2"
      maxLength={500}
      defaultValue={playlistDescription}
    />

  if (addingNewPlaylist === true){

    modalTitle = <StyledTitle>Add new playlist</StyledTitle>;
    callToAction = <StyledButtonSubmit form="popup-form" value="Create">Create</StyledButtonSubmit>;
    formAction = e => {e.preventDefault(); onAddPlaylist(e.target.playlistInput.value, e.target.playlistDescription.value)};
    textInput = <StyledInput
      name="playlistInput"
      id="input-playlist-popup"
      placeholder="Playlist Name"
      type="text"
      autoComplete = "off"
      min="1"
      required
    />

  } else if (importingNewPlaylist === true){

    modalTitle = <StyledTitle>Import a playlist from {importingType}</StyledTitle>
    callToAction = <StyledButtonSubmit form="popup-form" value="Import">Import</StyledButtonSubmit>
    formAction = 
      importingType === 'Spotify'
      ? e => {e.preventDefault(); onImportPlaylist(e.target.playlistInput.value)} 
      : e => {e.preventDefault(); onImportFromYoutube(e.target.playlistInput.value)};
    textInput = <StyledInput
      name="playlistInput"
      id="input-playlist-popup"
      placeholder="Playlist Url"
      type="text"
      defaultValue={playlistUrl}
      min="1"
      autoComplete = "off"
      required
    />
    separator = null;
    options = null;
    textArea = null;

  } else {

    modalTitle = <StyledTitle>Edit playlist</StyledTitle>
    callToAction = <StyledButtonSubmit form="popup-form" value="Update">Update</StyledButtonSubmit>
    formAction = e => {e.preventDefault(); onEditPlaylist(e.target.playlistInput.value, e.target.playlistDescription.value)};
    textInput = <StyledInput
      name="playlistInput"
      id="input-playlist-popup"
      placeholder="Playlist Name"
      type="text"
      defaultValue={playlistName}
      min="1"
      autoComplete = "off"
      required
    />
    separator = null;
    options = null;
  }

  return (
    <StyledPopup>
      <StyledContainer>
        <StyledContent id="popup-form" onSubmit={formAction}>
          {modalTitle}
          {textInput}
          {textArea}
          <StyledActions>
            <StyledButton onClick={onClose}>
              Cancel
            </StyledButton>
            {callToAction}
          </StyledActions>
        </StyledContent>
        {separator}
        {options}
      </StyledContainer>
    </StyledPopup>
  );

}

export default EditPlaylistPopup;