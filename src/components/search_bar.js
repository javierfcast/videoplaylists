import React, { Component } from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';

const StyledSearchInputContainer = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 10px 0 20px;
  position: relative;
`;

const Input = styled.input`
  border: none;
  border-bottom: 1px solid rgba(255,255,255,.1);
  padding: 12px 0 10px 0;
  width: 100%;
  font-size: 16px;
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

const SearchBarIcon = styled.a`
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
  z-index: 10;
`

class SearchBar extends Component {

  constructor(props) {
		super(props);
		this.state = { searchTerm: '' };
  }
  
  onInputChange = searchTerm => {
    this.setState({ searchTerm });
    this.props.onVideoSearch(searchTerm);
  }

  clearSearch = () => {
    this.setState({ searchTerm: '' })
    this.props.onVideoSearch('');
  }

  render() {
    
    let searchIcon = null;
    if (this.state.searchTerm === ''){
      searchIcon = 
      <SearchBarIcon>
        <MaterialIcon icon="search" color='#fff' />
      </SearchBarIcon>
    } else {
      searchIcon =
      <SearchBarIcon onClick={this.clearSearch}>
        <MaterialIcon icon="close" color='#fff' />
      </SearchBarIcon>
    }

    return (
      <StyledSearchInputContainer>
        <Input
          placeholder="Search videos on YouTube"
          type="text"
          value={this.state.searchTerm}
          onChange={event => this.onInputChange(event.target.value)}
          id="search-bar"
        />
        {searchIcon}
      </StyledSearchInputContainer>
    )
  }
}

export default SearchBar;
