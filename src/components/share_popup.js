import React from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react'
import CopyToClipboard from 'react-copy-to-clipboard'

const StyledPopup = styled.div`
  position: absolute;
  right: 0px;
  max-width: 220px;
  background: rgba(0,0,0,0.9);
  color: #fff;
  z-index: 100;
  hr{
    background: none;
    border: none;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .material-icons{
    margin-left: 10px;
  }
  &:focus{
    outline: none;
  }
  ${props => props.center && `
    left: 0px;
    margin: auto;
  `}
`;
const StyledContent = styled.div`
  margin: 0 auto;
  background: rgba(0,0,0,0.9);
  margin: 20px 0;
  p{
    margin-bottom: 40px;
  }
`;
const StyledTitle = styled.div`
  margin: 0 20px 20px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.6em;
`;
const StyledOptionsLabel = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 2px;
`;
const StyledButtonOption = styled.a`
  opacity: .6;
  cursor: pointer;
  transition: all .3s ease;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 2px;
  color: #fff;
  text-decoration: none;
  &:hover{
    opacity: 1;
  }
`;
const SharePopup = ({ user, open, onClose, name, url, onCopy, id, center }) => {

  if (!open) {
    return null;
  }

  if (!user) {
    return(
      <StyledPopup onBlur={onClose} id={id} tabIndex="0" center={center}>
        <StyledContent>
          <StyledTitle>Share: {name}</StyledTitle>
            <StyledButtonOption
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}`, '', 'width=550, height=400')} >
              Facebook
            </StyledButtonOption>
            <StyledButtonOption
              onClick={() => window.open(`https://twitter.com/intent/tweet?hashtags=VideoPlaylistsTv&text=${encodeURIComponent(name)}&url=${encodeURI(url)}`, '', 'width=550, height=400')} >
              Twitter
            </StyledButtonOption>
          <hr/>
          <CopyToClipboard text={url} onCopy={() => onCopy('Copied to clipboard!')}>
            <StyledButtonOption>
              Copy Link <MaterialIcon icon="link" color='#fff' />
            </StyledButtonOption>
          </CopyToClipboard>
        </StyledContent>
      </StyledPopup>
    );
  }
}

export default SharePopup;