import React from 'react';
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
  padding: 20px;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  height: calc(100vh - 193px);
  overflow-y: auto;
  ${media.xmedium`
    height: calc(100vh - 100px);
  `}
  h1{
    margin-bottom: 40px;
  }
  h3{
    margin-bottom: 40px;
    span{
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 700;
    }
  }
  a{
    color: #fff;
  }
  p{
    margin-bottom: 20px;
  }
`;

const About = (props) => {
   
  return (
    <StyledContainer>
      
      <h1>About</h1>
      <h3>VideoPlaylists.tv <span>beta</span> is a platform where everyone can create, share and discover great video playlists. For free. </h3>
      <h3>Enjoy!</h3>
      <p>The platform is currently in beta and its best experienced on desktops.</p>
      <p>Powered by <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">Youtube.</a></p>
      <p>Designed and Developed by <a href="https://javierfcast.com" target="_blank" rel="noopener noreferrer">Javier Castillo</a>, co-founder and creative director of <a href="https://royalestudios.com" target="_blank" rel="noopener noreferrer">Royale Studios,</a> a design and development agency based in Guatemala.</p>
      <p>Special thanks to Kevin Chanquín and Steven Quiroa for their help.</p>
      
    </StyledContainer>
  )
}

export default About;

