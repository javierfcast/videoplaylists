import React, { Component } from 'react';
import firebase from 'firebase';
import '@firebase/firestore';
import styled from 'styled-components';

const Aside = styled.div`
  color: #fff;
  min-height: 100vh;
`;
const StyledUserInfo = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 20px;
  padding-bottom: 40px;
  margin-bottom: 20px;
`;
const StyledUserImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 40px;
`;
const StyledUserName = styled.h4`
  font-size: 24px;
  font-weight: 100;
  margin-bottom: 20px;
`;
const StyledLogout = styled.a`
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
`;
const StyledPlaylistContainer = styled.div`
  padding: 20px;
`;
const StyledPlaylistForm = styled.form`
  margin-bottom: 40px;
`;
const StyledPlaylistLink = styled.a`
  padding: 10px 0;
  display: block;
  cursor: pointer;
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
const StyledInputSubmit = styled.input`
  position: relative;
  display: block;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  float: right;
  margin-top: -36px;
  cursor: pointer;
  z-index: 10;
  border: 1px solid transparent;
  transition: all .3s ease;
  height: 30px;
  width: 40px;
  line-height: 1;
  &:hover{
    border: 1px solid rgba(255,255,255,0.1);
  }
  &:focus{
    outline: none;
    border: 1px solid rgba(255,255,255,1);
  }
`;
const StyledTitleLabel = styled.h3`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;
  margin-bottom: 10px;
`;

//const Sidenav = ({toggleModal, onLogin, onLogout, onAddPlaylist, user}) => {
class Sidenav extends Component {

  constructor(props) {
    super(props);
    this.state = {
      playlistName: '',
      playlistSlug: '',
      myPlaylists: []
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onAddPlaylist = this.onAddPlaylist.bind(this);
    this.slugify = this.slugify.bind(this);
  }

  slugify(text) {
    return text.toString().toLowerCase()
    // eslint-disable-next-line 
    .replace(/\s+/g, '-')           // Replace spaces with -
    // eslint-disable-next-line 
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    // eslint-disable-next-line 
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
  }

  onInputChange(event) {
    this.setState({
      playlistName: event.target.value,
      playlistSlug: this.slugify(event.target.value)
    });
  }

  onAddPlaylist(event) {
    const user = this.props.user;
    console.log(`User id: ${user.uid}`);
    console.log(`playlist name: ${this.state.playlistName}`);
    console.log(`playlist slug: ${this.state.playlistSlug}`);
    // const docRef = firestore.collection('users').doc(user.uid).collection('playlists');
    const docRef = firebase.firestore().doc(`users/${user.uid}/playlists/${this.state.playlistSlug}`);
    docRef.set({
      playlistName: this.state.playlistName,
      playlistSlugName: this.state.playlistSlug
    }).then(function(){
      console.log('Playlist saved!');
    }).catch(function(error){
      console.log('Got an error:', error);
    })
    event.preventDefault();
  }

  render() {

    const PlaylistItem = this.props.myPlaylists.map((item) => {
      return (
        <li key = {item.playlistSlugName}>
          <StyledPlaylistLink onClick={() => this.props.onPlaylistSelect(item)}>{item.playlistName}</StyledPlaylistLink>
        </li>
      )
    });

    return (
      <Aside>
        {(this.props.user) ? (
          <div>
            <StyledUserInfo>
              <StyledUserImg width="100" src={this.props.user.photoURL} alt={this.props.user.displayName} />
              <p>Hola</p>
              <StyledUserName>{this.props.user.displayName || this.props.user.email}!</StyledUserName>
              <StyledLogout onClick={this.props.onLogout}>Logout</StyledLogout>
            </StyledUserInfo>
            <StyledPlaylistContainer>
              <StyledPlaylistForm onSubmit={this.onAddPlaylist}>
                <StyledInput 
                  placeholder="Add new playlist"
                  type="text"
                  value={this.state.playlistName}
                  onChange={this.onInputChange}
                  min="1"
                  required
                />
                <StyledInputSubmit
                  type="submit"
                  value="+"
                />
              </StyledPlaylistForm>
              <StyledTitleLabel>My Playlists - {this.props.myPlaylists.length}</StyledTitleLabel>
              <ul>
                {PlaylistItem}
              </ul>
            </StyledPlaylistContainer>
          </div>
          ) : (
          <div>
            <button onClick={this.props.onLogin}>Log In</button>
          </div>
          )
        }

      </Aside>
    )
  }

}

export default Sidenav;
