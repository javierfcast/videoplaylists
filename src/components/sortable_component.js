import React, { Component } from 'react';
import styled from 'styled-components';
import { css } from 'styled-components';

import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

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

//custom components

const VideoListContainer = styled.ul`
  list-style: none;
  width: 100%;
  height: calc(100vh - 420px);
  overflow-y: auto;
  ${media.xmedium`
    height: calc(100vh - 318px);
  `}
`;

const StyledSortableElement = styled.ul`
  width: 100%;
  display: flex;
  align-items: center;
`;

const SortableItem = SortableElement(({value}) => {
  return (
    <StyledSortableElement>
      {value}
    </StyledSortableElement>
  );
});

const SortableList = SortableContainer(({items, relatedSection}) => {
  return (
    <VideoListContainer>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
     {relatedSection}
    </VideoListContainer>
  );
});

class SortableComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({items: nextProps.videoItems});
  }
  
  onSortEnd = ({oldIndex, newIndex}) => {
    const {items} = this.state;
    this.props.onSort(arrayMove(items, oldIndex, newIndex))
    this.setState({
      items: arrayMove(items, oldIndex, newIndex),
    });
  };

  render() {
    const {items} = this.state;
    if (!items) return null
    
    return <SortableList
      items={items}
      onSortEnd={this.onSortEnd}
      useDragHandle={true} 
      relatedSection={this.props.relatedSection}
      />;
  }
}

export default SortableComponent;