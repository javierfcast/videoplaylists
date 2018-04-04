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
  height: calc(100vh - 193px);
  overflow-y: auto;
  ${media.xmedium`
    height: calc(100vh - 100px);
  `}
  h1{
    text-align: center;
  }
  a{
    color: #fff;
  }
`;

const About = (props) => {
   
  return (
    <StyledContainer>
      
      <h1>Privacy Policy</h1>
     
      <p><br />This privacy policy has been compiled to better serve those who are concerned with how their 'Personally Identifiable Information' (PII) is being used online. PII, as described in US privacy law and information security, is information that can be used on its own or with other information to identify, contact, or locate a single person, or to identify an individual in context. Please read our privacy policy carefully to get a clear understanding of how we collect, use, protect or otherwise handle your Personally Identifiable Information in accordance with our website.</p>
      <p><br />What personal information do we collect from the people that visit our blog, website or app?</p>
      <p>When ordering or registering on our site, as appropriate, you may be asked to enter your name, email address, credit card information or other details to help you with your experience.</p>
      <p>When do we collect information?</p>
      <p>We collect information from you when you register on our site, place an order or enter information on our site.</p>
      <p><br />How do we use your information?</p>
      <p>We may use the information we collect from you when you register, make a purchase, sign up for our newsletter, respond to a survey or marketing communication, surf the website, or use certain other site features in the following ways:</p>
      <p><br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;To personalize your experience and to allow us to deliver the type of content and product offerings in which you are most interested.<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;To quickly process your transactions.</p>
      <p>How do we protect your information?</p>
      <p>Our website is scanned on a regular basis for security holes and known vulnerabilities in order to make your visit to our site as safe as possible.</p>
      <p><br />We use regular Malware Scanning.</p>
      <p><br />Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. In addition, all sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology.</p>
      <p>We implement a variety of security measures when a user places an order enters, submits, or accesses their information to maintain the safety of your personal information.</p>
      <p>All transactions are processed through a gateway provider and are not stored or processed on our servers.</p>
      <p>Do we use 'cookies'?</p>
      <p>We do not use cookies for tracking purposes</p>
      <p>You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies. You do this through your browser settings. Since browser is a little different, look at your browser's Help Menu to learn the correct way to modify your cookies.</p>
      <p><br />If you turn cookies off, Some of the features that make your site experience more efficient may not function properly.that make your site experience more efficient and may not function properly.</p>
      <p><br />Third-party disclosure</p>
      <p>We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential. We may also release information when it's release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property or safety.&nbsp;</p>
      <p>However, non-personally identifiable visitor information may be provided to other parties for marketing, advertising, or other uses.</p>
      <p>Third-party links</p>
      <p>Occasionally, at our discretion, we may include or offer third-party products or services on our website. These third-party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites. Nonetheless, we seek to protect the integrity of our site and welcome any feedback about these sites.</p>
      <p>Google</p>
      <p>Google's advertising requirements can be summed up by Google's Advertising Principles. They are put in place to provide a positive experience for users. https://support.google.com/adwordspolicy/answer/1316548?hl=en&nbsp;</p>
      <p><br />We use Google AdSense Advertising on our website.</p>
      <p>Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on previous visits to our site and other sites on the Internet. Users may opt-out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy.</p>
      <p><br />We have implemented the following:</p>
      <p>We, along with third-party vendors such as Google use first-party cookies (such as the Google Analytics cookies) and third-party cookies (such as the DoubleClick cookie) or other third-party identifiers together to compile data regarding user interactions with ad impressions and other ad service functions as they relate to our website.</p>
      <p>Opting out:<br />Users can set preferences for how Google advertises to you using the Google Ad Settings page. Alternatively, you can opt out by visiting the Network Advertising Initiative Opt Out page or by using the Google Analytics Opt Out Browser add on.</p>
      <p>California Online Privacy Protection Act</p>
      <p>CalOPPA is the first state law in the nation to require commercial websites and online services to post a privacy policy. The law's reach stretches well beyond California to require any person or company in the United States (and conceivably the world) that operates websites collecting Personally Identifiable Information from California consumers to post a conspicuous privacy policy on its website stating exactly the information being collected and those individuals or companies with whom it is being shared. - See more at: http://consumercal.org/california-online-privacy-protection-act-caloppa/#sthash.0FdRbT51.dpuf</p>
      <p><br />According to CalOPPA, we agree to the following:</p>
      <p>Users can visit our site anonymously.<br />Once this privacy policy is created, we will add a link to it on our home page or as a minimum, on the first significant page after entering our website.</p>
      <p>Our Privacy Policy link includes the word 'Privacy' and can easily be found on the page specified above.</p>
      <p>You will be notified of any Privacy Policy changes:<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;On our Privacy Policy Page</p>
      <p>Can change your personal information:<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;By logging in to your account</p>
      <p>How does our site handle Do Not Track signals?</p>
      <p>We honor Do Not Track signals and Do Not Track, plant cookies, or use advertising when a Do Not Track (DNT) browser mechanism is in place.</p>
      <p>Does our site allow third-party behavioral tracking?</p>
      <p>It's also important to note that we allow third-party behavioral tracking</p>
      <p>COPPA (Children Online Privacy Protection Act)</p>
      <p>When it comes to the collection of personal information from children under the age of 13 years old, the Children's Online Privacy Protection Act (COPPA) puts parents in control. The Federal Trade Commission, United States' consumer protection agency, enforces the COPPA Rule, which spells out what operators of websites and online services must do to protect children's privacy and safety online.</p>
      <p><br />We do not specifically market to children under the age of 13 years old.<br />Do we let third-parties, including ad networks or plug-ins collect PII from children under 13?</p>
      <p>Fair Information Practices</p>
      <p>The Fair Information Practices Principles form the backbone of privacy law in the United States and the concepts they include have played a significant role in the development of data protection laws around the globe. Understanding the Fair Information Practice Principles and how they should be implemented is critical to comply with the various privacy laws that protect personal information.</p>
      <p><br />In order to be in line with Fair Information Practices we will take the following responsive action, should a data breach occur:<br />We will notify the users via in-site notification<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;Within 7 business days</p>
      <p>We also agree to the Individual Redress Principle which requires that individuals have the right to legally pursue enforceable rights against data collectors and processors who fail to adhere to the law. This principle requires not only that individuals have enforceable rights against data users, but also that individuals have recourse to courts or government agencies to investigate and/or prosecute non-compliance by data processors.</p>
      
    </StyledContainer>
  )
}

export default About;

