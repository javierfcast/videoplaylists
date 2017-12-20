import React, { Component } from 'react';
import firebase from 'firebase';
import '@firebase/firestore';
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

const StyledContainer = styled.div`
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

  componentWillMount() {

    //Browse Playlists Rutes
    let userRef = firebase.firestore().collection('users').doc(this.props.match.params.id);

  };

  render() {
    // if (!user){
    //   return <div><h1>User not found</h1></div>
    // }
    return (
      <StyledContainer>
        <StyledHeader>
          <h1>User: {this.props.match.params.id}</h1>
        </StyledHeader>
        <StyledContent>
          Lorem ipsum dolor sit amet
        </StyledContent>
      </StyledContainer>
    )
  }
}

export default User;

