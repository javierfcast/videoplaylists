import React, { Component } from 'react';
import firebase from 'firebase';
import '@firebase/firestore';
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

const StyledUserContainer = styled.div`
  padding: 20px;
  width: 100%;
`;
const StyledHeader = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 20px;
`;
const StyledContent = styled.div`
  list-style: none;
  width: 100%;
  height: calc(100vh - 358px);
  overflow-y: auto;
  ${media.xmedium`
    height: calc(100vh - 258px);
  `}
`;

class User extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      playlists: [],
    };
  };

  componentWillMount() {
    
    //Get User Info
    let userRef = firebase.firestore().collection('users').doc(this.props.match.params.id);
    
    userRef.get().then((doc) => {
      if (doc.exists) {
        this.setState({
          user: doc.data(),
        })
      } else {
        console.log("No such document!");
        this.setState({
          user: 'not found',
        })
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });

    //Browse Playlists Rutes



  };

  render() {
    if (!this.state.user) {
      return (
        <StyledUserContainer>
          <StyledHeader>
            <h1>Loading...</h1>
          </StyledHeader>
          <StyledContent>
            
          </StyledContent>
        </StyledUserContainer>
      )
    }

    if (this.state.user === 'not found'){
      return (
        <StyledUserContainer>
          <StyledHeader>
            <h1>User not found</h1>
          </StyledHeader>
          <StyledContent>
            Browse or go to Recently Active Users to search for more.
        </StyledContent>
        </StyledUserContainer>
      )
    }

    const user = this.state.user;

    return (
      <StyledUserContainer>
        <StyledHeader>
          <h1>{user.displayName}</h1>
        </StyledHeader>
        <StyledContent>
          Lorem ipsum dolor sit amet
        </StyledContent>
      </StyledUserContainer>
    )
  }
}

export default User;

