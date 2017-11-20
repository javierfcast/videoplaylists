import React, { Component } from 'react';
import styled from 'styled-components';

const StyledBackdrop = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: rgba(0,0,0,0.3);
  padding: 50px;
`;

const StyledModal = styled.div`
  background-color: #fff;
  maxWidth: 500px;
  minHeight: 300px;
  margin: 0 auto;
  padding: 30px;
`;

const StyledFooter = styled.div``;

const StyledButton = styled.button``;

class Modal extends Component {
  render () {
    //Render nothing if the 'show' prop is false
    if(!this.props.show){
      return null;
    }
      
    return (
      <StyledBackdrop>
        <StyledModal>
          {this.props.children}
          <StyledFooter>
            <StyledButton onClick={this.props.onClose}>
              Close
            </StyledButton>
          </StyledFooter>
        </StyledModal>
      </StyledBackdrop>
    );
  }
}

export default Modal;