import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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

const StyledContainer = styled.div`
  padding: 20px 20px 0;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;
const StyledHeader = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 20px;
`;
const StyledContent = styled.div`
  list-style: none;
  width: calc(100% + 20px);
  margin-left: -10px;
  padding: 20px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  ${media.small`
    overflow-y: auto;
  `}  
`;
const StyledUserItemContainer = styled.div`
  padding: 10px;
  width: 50%;
  ${media.xmedium`
    width: 33.3333%;
  `}
  ${media.xlarge`
    width: 25%;
  `}
`
const StyledUserItem = styled(Link)`
  display: block;
  height: 100%;
  padding: 20px 10px;
  border: 1px solid rgba(255,255,255,0.1);
  text-align: center;
  color: #fff;
  text-decoration: none;
  transition: all .3s;
  &:hover{
    border: 1px solid #fff;
  }
`;
const StyledUserImage = styled.img`
  border-radius: 50%;
  max-width: 100px;
  margin-bottom: 20px;
`;

class Users extends Component {

  constructor(props) {
    super(props);
    this.state = {
      usersList: []
    };
  };


  componentWillMount() {

    //Get Users
    let usersRef = firebase.firestore().collection('users');

    //Order them by recently loged in
    usersRef = usersRef.orderBy("lastLogin", "desc");

    //Query Data
    this._unsubscribe = usersRef.onSnapshot(querySnapshot => {
      const usersList = [];
      querySnapshot.forEach(function (doc) {
        usersList.push(doc.data());
      });
      this.setState({ usersList })
    });

  };

  componentWillUnmount() {
    this._unsubscribe()
  }

  render() {

    const userItems = this.state.usersList.map((user) => {
      return (
        <StyledUserItemContainer key={user.uid}>
          <StyledUserItem to = {`/users/${user.uid}`} key={user.uid}> 
            <StyledUserImage src={user.photoURL} />
            <h4>{user.displayName}</h4>
            {/* <p>{user.uid}</p> */}
          </StyledUserItem>
        </StyledUserItemContainer>
      )
    });

    return (
      <StyledContainer>
        <StyledHeader>
          <h1>Recently Active Users</h1>
        </StyledHeader>
        <StyledContent>
          {userItems}
        </StyledContent>
      </StyledContainer>
    )
  }
}

export default Users;

