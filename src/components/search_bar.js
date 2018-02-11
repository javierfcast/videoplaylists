import React, { Component } from 'react';
import styled from 'styled-components';

const StyledSearchInputContainer = styled.div`
  padding: 20px ;
  width: 100%;
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

class SearchBar extends Component {

  constructor(props) {
		super(props);
		this.state = { searchTerm: '' };
	}

  render() {
    return (
      <StyledSearchInputContainer className='searchbar'>
        <Input
          placeholder="Search videos on YouTube"
          type="text"
          value={this.state.searchTerm}
          onChange={event => this.onInputChange(event.target.value)}
        />
      </StyledSearchInputContainer>
    )
  }

  onInputChange = searchTerm => {
    this.setState({searchTerm});
    this.props.onVideoSearch(searchTerm);
  }
}

export default SearchBar;
