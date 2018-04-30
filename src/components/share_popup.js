import React from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';
import CopyToClipboard from 'react-copy-to-clipboard';

const StyledPopup = styled.div`
  position: absolute;
  right: 0px;
  max-width: 220px;
  color: #fff;
  z-index: 999;
  hr{
    background: none;
    border: none;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .material-icons{
    margin-right: 10px;
  }
  .fab {
    font-size: 18px;
    margin-right: 10px;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &:focus{
    outline: none;
  }
  ${props => props.center && `
    left: 0px;
    margin: auto;
  `}
  ${props => props.large && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    padding: 20px;
    max-width: none;
  `}
`;
const StyledContent = styled.div`
  background: rgba(0,0,0,0.9);
  padding: 20px 0 10px;
  p{
    margin-bottom: 40px;
  }
  ${props => props.large && `
    max-width: 480px;
    border: 1px solid rgba(255,255,255,0.1);
    padding: 40px 0;
    margin: 0 auto;
    position: relative;
    z-index: 101;
  `}
`;
const StyledTitle = styled.div`
  margin: 0 20px 20px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.6em;
  ${props => props.large && `
    margin: 0 40px 40px;
    font-size: 18px;
    font-weight: 100;
    text-transform: none;
    letter-spacing: normal;
    line-height: normal;
  `}
`;
const StyledButtonOption = styled.a`
  opacity: .6;
  cursor: pointer;
  transition: all .3s ease;
  margin: 0 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 0;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 2px;
  color: #fff;
  text-decoration: none;
  &:hover{
    opacity: 1;
  }
  ${props => props.large && `
    margin: 0 40px;
  `}
`;
const StyledClickOutside = styled.div`
  position: absolute;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  ${props => !props.large && `
    display: none;
  `}
`;
const SharePopup = ({ user, open, onClose, name, url, onCopy, id, center, large }) => {

  if (!open) {
    return null;
  }

  return(
    <StyledPopup onBlur={onClose} id={id} center={center} large={large} tabIndex={large ? null : "0"}>
      <StyledContent large={large} >
        <StyledTitle large={large} >Share: {name}</StyledTitle>
          <StyledButtonOption
            large={large}
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}`, '', 'width=550, height=400')} >
            <i className="fab fa-facebook" /> Facebook
          </StyledButtonOption>
          <StyledButtonOption
            large={large}
            onClick={() => window.open(`https://twitter.com/intent/tweet?hashtags=VideoPlaylistsTv&text=${encodeURIComponent(name)}&url=${encodeURI(url)}`, '', 'width=550, height=400')} >
            <i className="fab fa-twitter" /> Twitter
          </StyledButtonOption>
        <hr/>
        <CopyToClipboard text={url} onCopy={() => onCopy('Copied to clipboard!')}>
          <StyledButtonOption large={large}>
            <MaterialIcon icon="link" color='#fff' /> Copy Link
          </StyledButtonOption>
        </CopyToClipboard>
      </StyledContent>
      <StyledClickOutside large={large} onClick={onClose} />
    </StyledPopup>
  );
}

export default SharePopup;