import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  0% {
    opacity: 0;
    filter: blur(25px);
  }
  100% {
    opacity: 1;
    filter: blur(0px);
  }
`;

export default fadeIn;
