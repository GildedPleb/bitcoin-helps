import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useCallback, useState } from "react";
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
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

import fadeIn from "../../../styles/fade-in";
import fadeOut from "../../../styles/fade-out";
import { FADE_IN_OUT } from "../../../utilities/constants";
import getEnvironmentVariable from "../../../utilities/get-environment";

const hashtags = ["BitcoinFixesThis", "Bitcoin"];
const suggestedFollow = "gildedpleb";

const DropDown = styled.div<{
  isShown: boolean;
  willUnmount: boolean;
}>`
  display: ${(properties) => (properties.isShown ? "flex" : "none")};
  flex-direction: column;
  position: absolute;
  gap: 2.5px;
  top: 55px;
  right: 4px;
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
  z-index: 9;
  border-radius: 50px;
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

const StyledLinkButton = styled.button`
  ${sharedButtonStyles};
`;

interface ShareMenuProperties {
  onCopyLink: () => void;
  onCopyText: () => void;
  isShown: boolean;
  willUnmount: boolean;
  title: string;
  subtitle: string;
}

const BASE_URL = getEnvironmentVariable("VITE_DOMAIN_STAGED", "");

// eslint-disable-next-line react/display-name
const ShareMenu = React.forwardRef<HTMLDivElement, ShareMenuProperties>(
  (
    { isShown, willUnmount, onCopyText, onCopyLink, title, subtitle },
    reference
  ) => {
    const url = window.location.href.includes("localhost")
      ? BASE_URL + new URL(window.location.href).pathname
      : window.location.href;

    const iconSize = 32;
    const [coppied, setCoppied] = useState(false);
    const [coppiedLink, setCoppiedLink] = useState(false);

    const handleCopy = useCallback(() => {
      setCoppied(true);
      onCopyText();
      setTimeout(() => {
        setCoppied(false);
      }, 1000);
    }, [onCopyText]);

    const handleCopyLink = useCallback(() => {
      setCoppiedLink(true);
      onCopyLink();
      setTimeout(() => {
        setCoppiedLink(false);
      }, 1000);
    }, [onCopyLink]);

    const hashtag = hashtags[0];

    const contentLength =
      title.length +
      ": ".length +
      subtitle.length +
      " ".length +
      url.length +
      " ".length +
      hashtags.join(" ").length +
      " ".length +
      suggestedFollow.length +
      "via ".length;

    const truncatedSubtitle =
      contentLength > 280
        ? `${subtitle.slice(0, 280 - contentLength)}…`
        : subtitle;

    return (
      <DropDown isShown={isShown} willUnmount={willUnmount} ref={reference}>
        <StyledTwitterShareButton
          url={url}
          title={`${title}: ${truncatedSubtitle}`}
          hashtags={hashtags}
          via={suggestedFollow}
          resetButtonStyle={false}
        >
          {/* <!-- Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width="32"
            height="32"
            preserveAspectRatio="xMidYMid meet"
          >
            <circle cx="256" cy="256" r="256" fill="black" />
            <path
              fill="white"
              transform="translate(107, 100) scale(0.58)"
              d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
            />
          </svg>
        </StyledTwitterShareButton>
        <StyledFacebookShareButton
          url={url}
          quote={title}
          hashtag={`#${hashtag}`}
          resetButtonStyle={false}
        >
          <FacebookIcon size={iconSize} round />
        </StyledFacebookShareButton>
        <StyledLinkedinShareButton
          url={url}
          resetButtonStyle={false}
          summary={subtitle}
          title={title}
        >
          <LinkedinIcon size={iconSize} round />
        </StyledLinkedinShareButton>
        <StyledTelegramShareButton
          url={url}
          title={title}
          resetButtonStyle={false}
        >
          <TelegramIcon size={iconSize} round />
        </StyledTelegramShareButton>
        <StyledWhatsappShareButton
          url={url}
          title={title}
          separator=":: "
          resetButtonStyle={false}
        >
          <WhatsappIcon size={iconSize} round />
        </StyledWhatsappShareButton>
        <StyledPinterestShareButton
          url={url}
          media={`${BASE_URL}/does_Bitcoin_help.png`}
          windowWidth={1000}
          windowHeight={730}
          resetButtonStyle={false}
          description={`${title}: ${subtitle}`}
        >
          <PinterestIcon size={iconSize} round />
        </StyledPinterestShareButton>
        <StyledRedditShareButton
          url={url}
          title={`${title}: ${subtitle}`}
          resetButtonStyle={false}
        >
          <RedditIcon size={iconSize} round />
        </StyledRedditShareButton>
        <StyledLineShareButton
          url={url}
          title={`${title}: ${subtitle}`}
          resetButtonStyle={false}
        >
          <LineIcon size={iconSize} round />
        </StyledLineShareButton>
        <StyledEmailShareButton
          url={url}
          subject={title}
          body={`${title}

${subtitle}

`}
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
        <StyledLinkButton onClick={handleCopyLink}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeWidth="2.25"
            width="60"
            height="60"
            fill={coppiedLink ? "orange" : "none"}
          >
            <circle cx="12" cy="12" r="10.5" fill="gray" stroke="none" />
            <g transform="scale(.5) translate(11 18) rotate(-45 12 12)">
              <path
                d="M12 12 l-4 0 a4 4 0 0 1 0 -8 l8 0 q4 0 4 4"
                stroke="white"
              />
              <path
                d="M12 12 l-4 0 a4 4 0 0 1 0 -8 l8 0 q4 0 4 4"
                stroke="white"
                transform="translate(12, 12) rotate(180) translate(-22.5, -4)"
              />
            </g>
          </svg>
        </StyledLinkButton>
      </DropDown>
    );
  }
);

export default ShareMenu;
