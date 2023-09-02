import { css } from "@emotion/react";
import styled from "@emotion/styled";

import fadeIn from "../../../styles/fade-in";
import { type LeftToRightOrRightToLeft } from "../../../types";

interface ParagraphProperties {
  isRtl: LeftToRightOrRightToLeft;
}

const StyledText = styled.div<ParagraphProperties>`
  width: calc(100vw - 4rem);
  max-width: 650px;
  font-size: 1.2rem;

  p {
    margin-bottom: 2.5vh;
    text-indent: 2rem;
    line-height: 1.6;
  }

  span {
    animation: ${fadeIn} 1s 0s forwards;
    line-height: 1.6;
  }

  br {
    line-height: 1.6;
  }

  span:first-of-type,
  br + span {
    margin-left: 2rem;
  }

  ${(properties) =>
    properties.isRtl === "rtl" &&
    css`
      text-align: right;
    `}
`;

export default StyledText;
