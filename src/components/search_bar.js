import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';

const StyledSearchInputContainer = styled.div`
  padding: 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`;

const Input = styled.input`
  border: none;
  border-bottom: 1px solid rgba(255,255,255,.1);
  padding: 10px 0;
  width: 100%;
  font-size: 18px;
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

const StyledButton = styled(Link)`
  margin-left: 15px; 
  opacity: .6;
  cursor: pointer;
  transition: all .3s ease;
  &:hover{
    opacity: 1;
  }
`;

class SearchBar extends Component {

  constructor(props) {
		super(props);
		this.state = { searchTerm: '' };
	}

  render() {
    return (
      <StyledSearchInputContainer>
        <Input
          placeholder="Search videos on YouTube"
          type="text"
          value={this.state.searchTerm}
          onChange={event => this.onInputChange(event.target.value)}
        />
        <StyledButton to="/search">
          <MaterialIcon icon="local_offer" color='#fff' size="22px" />
        </StyledButton>
      </StyledSearchInputContainer>
    )
  }

  onInputChange = searchTerm => {
    this.setState({searchTerm});
    this.props.onVideoSearch(searchTerm);
  }
}

export default SearchBar;
