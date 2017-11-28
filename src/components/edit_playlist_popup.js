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
const StyledPlaylistForm = styled.form``;
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
const StyledInputSubmit = styled.input`
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
// constructor(props) {
  //   super(props);
  //   const playlistName = this.props.selectedPlaylist !== null ? this.props.selectedPlaylist.playlistName : '';
  //   const playlistSlug = this.props.selectedPlaylist !== null ? this.props.selectedPlaylist.playlistSlug : '';
  //   this.state = {
  //     playlistName,
  //     playlistSlug,
  //   };

  //   // this.setState({
  //   //   playlistName: this.props.selectedPlaylist.playlistName,
  //   //   playlistSlug: this.props.selectedPlaylist.playlistSlug
  //   // });

  //   // if (!this.props.open) {
  //   //   return null;
  //   // }

  //   // if (this.props.addingNewPlaylist === true) {
      
  //   // } else {
  //   //   this.state = {
  //   //     playlistName: this.props.selectedPlaylist.playlistName,
  //   //     playlistSlug: this.props.selectedPlaylist.playlistSlug
  //   //   }
  //   // }

  //   // console.log(this.props.selectedPlaylist.playlistName)

  //   this.onInputChange = this.onInputChange.bind(this);
  //   this.onAddPlaylist = this.onAddPlaylist.bind(this);
  //   this.slugify = this.slugify.bind(this);
// }

const EditPlaylistPopup = ({ user, open, onClose, slugify, onEditPlaylistInputChange, onAddPlaylist, playlistName, playlistSlug, selectedPlaylist, addingNewPlaylist}) => {

  if (!open) {
    return null;
  }

  let modalTitle = null;
  let callToAction = null;
  if(addingNewPlaylist === true){
    modalTitle = <StyledTitle>Add new playlist</StyledTitle>
    callToAction = <StyledInputSubmit type="submit" value="Create" />
  } else {
    modalTitle = <StyledTitle>Edit playlist</StyledTitle>
    callToAction = <StyledInputSubmit type="submit" value="Update" />
  }

    // console.log(this.props.user);
    // console.log(this.props.selectedPlaylist);

  return (
    <StyledPopup>
      <StyledContent>
        {modalTitle}
        <StyledPlaylistForm onSubmit={onAddPlaylist}>
          <StyledInput
            id="input-playlist-popup"
            placeholder="Playlist Name"
            type="text"
            value={playlistName}
            onChange={onEditPlaylistInputChange}
            min="1"
            required
          />
          <StyledActions>
            <StyledButton onClick={onClose}>
              Cancel
            </StyledButton>
            {callToAction}
          </StyledActions>
        </StyledPlaylistForm>  
      </StyledContent>
    </StyledPopup>
  );

}

export default EditPlaylistPopup;