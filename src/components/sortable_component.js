import React, { Component } from 'react';
import styled from 'styled-components';

import {SortableContainer, SortableElement, arrayMove, SortableHandle} from 'react-sortable-hoc';

//custom components

const VideoListContainer = styled.ul`
  list-style: none;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
`;

const StyledSortableElement = styled.ul`
  width: 100%;
  display: flex;
  align-items: center;
`;

const StyledDragHandle = styled.span`
  cursor: grab;
  position: relative;
  margin-right: -40px;
  width: 24px;
  height: 24px;
  z-index: 99px;
`;
const StyledSortableItem = styled.div`
  margin-left: 16px;
  width: 100%;
`

const DragHandle = SortableHandle(() =>
      <StyledDragHandle></StyledDragHandle>
    );;

  const SortableItem = SortableElement(({ value }) => {
    return (
      <StyledSortableElement>
        <DragHandle />
        <StyledSortableItem>{value}</StyledSortableItem>
      </StyledSortableElement>
    );
  });

  const SortableList = SortableContainer(({ items, relatedSection, handleScroll}) => {
    console.log('here')
    return (
      <VideoListContainer onScroll={handleScroll}>
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
      items: this.props.videoItems,
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
      handleScroll={this.props.handleScroll}
      />;
  }
}

export default SortableComponent;