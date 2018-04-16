import React from 'react';
import styled from 'styled-components';

const StyledPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  padding: 20px;
`;
const StyledContent = styled.form`
  position: relative;
  z-index: 101;
  max-width: 480px;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 40px;
  margin: 0 auto;
  background: rgba(0,0,0,0.9);
`;
const StyledTitle = styled.h2`
  margin-bottom: 40px;
  font-size: 18px;
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
const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const StyledButton = styled.a`
  margin-left: 10px;
  margin-top: 40px;
  height: 40px;
  line-height: 40px;
  display: inline-block;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0 20px;
  transition: all .3s ease;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;
const StyledButtonSubmit = styled.button`
  margin-left: 10px;
  margin-top: 40px;
  height: 40px;
  line-height: 40px;
  display: inline-block;
  border-radius: 0;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0 20px;
  transition: all .3s ease;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  background: linear-gradient(45deg, rgba(68,70,181,0.6) 0%,rgba(74,0,114,0.8) 100%);
  &:hover{
    border: 1px solid rgba(255,255,255,1);
  }
`;
const StyledClickOutside = styled.div`
  position: absolute;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const addTagsPopup = ({ user, open, onClose, onAddTag, isTagSearch, onAddTagSearch}) => {

  if (!open) {
    return null;
  }
  const onSubmit = isTagSearch? onAddTagSearch: onAddTag;
  return (
    <StyledPopup>
      <StyledContent id="popup-form" onSubmit={onSubmit}>
      <StyledTitle>Add new tag</StyledTitle>
      <StyledInput
            id="input-playlist-popup"
            placeholder="Tag Name"
            type="text"
            name="tagInput"
            min="1"
            autoComplete = "off"
            required
        />
        <StyledActions>
          <StyledButton onClick={onClose}>
            Cancel
          </StyledButton>
          <StyledButtonSubmit form="popup-form" value="Add">Add</StyledButtonSubmit>
        </StyledActions>
      </StyledContent>
      <StyledClickOutside onClick={onClose} />
    </StyledPopup>
  );

}

export default addTagsPopup;