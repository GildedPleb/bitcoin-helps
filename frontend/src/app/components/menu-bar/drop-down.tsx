import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useCallback, useState } from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LineIcon,
  LineShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  PinterestIcon,
  PinterestShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

import fadeIn from "../../../styles/fade-in";
import fadeOut from "../../../styles/fade-out";
import { FADE_IN_OUT } from "../../../utilities/constants";

const hashtag = [
  "Bitcoin",
  "BitcoinHelps",
  "BitcoinFixesThis",
  "BitcoinFixesEverything",
];
const tagLine = "Bitcoin helps no matter who you are or what you care about.";
const suggestedFollow = "gildedpleb";
const title =
  "You've heard it said \"Bitcoin fixes everything.\" But you know that 'everything' is hard to prove. Well...\n\nHere is the proof.\n\n";

const DropDown = styled.div<{ isShown: boolean; willUnmount: boolean }>`
  display: ${(properties) => (properties.isShown ? "flex" : "none")};
  flex-direction: column;
  position: absolute;
  gap: 2.5px;
  top: calc(5vh + 65px);
  right: 2.3em;
  ${({ isShown, willUnmount }) =>
    isShown && !willUnmount
      ? css`
          animation: ${fadeIn} ${FADE_IN_OUT}ms forwards;
        `
      : css`
          animation: ${fadeOut} ${FADE_IN_OUT}ms forwards;
        `}
  background-color: white;
  box-shadow: 0 0 10px 10px rgba(255, 255, 255, 1);
  z-index: 100;
`;

const sharedButtonStyles = css`
  border-radius: 50%;
  border: 2px solid white;
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background-color: transparent;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    border: 2px solid orange;
  }
  &:focus {
    outline: none;
    border: 2px solid #2684ff;
  }
  & > svg > circle {
    r: "32";
  }
`;

const StyledTwitterShareButton = styled(TwitterShareButton)`
  ${sharedButtonStyles};
`;
const StyledFacebookShareButton = styled(FacebookShareButton)`
  ${sharedButtonStyles};
`;
const StyledLinkedinShareButton = styled(LinkedinShareButton)`
  ${sharedButtonStyles};
`;
const StyledTelegramShareButton = styled(TelegramShareButton)`
  ${sharedButtonStyles};
`;
const StyledWhatsappShareButton = styled(WhatsappShareButton)`
  ${sharedButtonStyles};
`;
const StyledPinterestShareButton = styled(PinterestShareButton)`
  ${sharedButtonStyles};
`;
const StyledRedditShareButton = styled(RedditShareButton)`
  ${sharedButtonStyles};
`;
const StyledLineShareButton = styled(LineShareButton)`
  ${sharedButtonStyles};
`;
const StyledEmailShareButton = styled(EmailShareButton)`
  ${sharedButtonStyles};
`;
const StyledCopyButton = styled.button`
  ${sharedButtonStyles};
`;

/**
 *
 * @param root0 - Props
 */
function ShareMenu({
  isShown,
  willUnmount,
  onCopy,
}: {
  isShown: boolean;
  willUnmount: boolean;
  onCopy: () => void;
}) {
  const url = window.location.href;

  const iconSize = 32;
  const [coppied, setCoppied] = useState(false);
  const handleCopy = useCallback(() => {
    setCoppied(true);
    onCopy();
    setTimeout(() => {
      setCoppied(false);
    }, 1000);
  }, [onCopy]);

  return (
    <DropDown isShown={isShown} willUnmount={willUnmount}>
      <StyledTwitterShareButton
        url={url}
        title={title}
        hashtags={hashtag}
        via={suggestedFollow}
        resetButtonStyle={false}
      >
        <TwitterIcon size={iconSize} round />
      </StyledTwitterShareButton>
      <StyledFacebookShareButton
        url={url}
        quote={tagLine}
        hashtag={`#${hashtag[0]}`}
        resetButtonStyle={false}
      >
        <FacebookIcon size={iconSize} round />
      </StyledFacebookShareButton>
      <StyledLinkedinShareButton
        url={url}
        resetButtonStyle={false}
        summary={title}
        title={title}
      >
        <LinkedinIcon size={iconSize} round />
      </StyledLinkedinShareButton>
      <StyledTelegramShareButton
        url={url}
        title={tagLine}
        resetButtonStyle={false}
      >
        <TelegramIcon size={iconSize} round />
      </StyledTelegramShareButton>
      <StyledWhatsappShareButton
        url={url}
        title={tagLine}
        separator=":: "
        resetButtonStyle={false}
      >
        <WhatsappIcon size={iconSize} round />
      </StyledWhatsappShareButton>
      <StyledPinterestShareButton
        url={url}
        media={`${url}/does_Bitcoin_help.png`}
        windowWidth={1000}
        windowHeight={730}
        resetButtonStyle={false}
        description={title}
      >
        <PinterestIcon size={iconSize} round />
      </StyledPinterestShareButton>
      <StyledRedditShareButton
        url={url}
        title={tagLine}
        resetButtonStyle={false}
      >
        <RedditIcon size={iconSize} round />
      </StyledRedditShareButton>
      <StyledLineShareButton url={url} title={tagLine} resetButtonStyle={false}>
        <LineIcon size={iconSize} round />
      </StyledLineShareButton>
      <StyledEmailShareButton
        url={url}
        subject={title}
        body="body"
        resetButtonStyle={false}
      >
        <EmailIcon size={iconSize} round />
      </StyledEmailShareButton>
      <StyledCopyButton onClick={handleCopy}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          strokeWidth="3"
          width="32"
          height="32"
        >
          <circle cx="32" cy="32" r="31" fill="gray" />
          <rect
            x="20"
            y="15"
            width="18"
            height="26"
            fill={coppied ? "orange" : "gray"}
            stroke="white"
          />
          <rect
            x="27"
            y="22"
            width="18"
            height="26"
            fill={coppied ? "orange" : "gray"}
            stroke="white"
          />
        </svg>
      </StyledCopyButton>
    </DropDown>
  );
}

export default ShareMenu;
