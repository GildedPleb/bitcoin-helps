import { keyframes } from "@emotion/react";

const fadeOut = keyframes`
  from {
    opacity: 1;
    filter: blur(0);
  }
  to {
    opacity: 0;
    filter: blur(15px);
  }
`;

export default fadeOut;
