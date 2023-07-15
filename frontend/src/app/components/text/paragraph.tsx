import { css } from "@emotion/react";
import styled from "@emotion/styled";

import fadeIn from "../../../styles/fade-in";
import { type LeftToRightOrRightToLeft } from "../../../types";

interface ParagraphProperties {
  isRtl: LeftToRightOrRightToLeft;
}

const StyledText = styled.div<ParagraphProperties>`
  width: calc(100vw - 50px);
  max-width: 650px;
  font-size: 1.2rem;
  margin-top: 25px;

  p {
    margin-bottom: 31px;
    text-indent: 20px;
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
    margin-left: 20px;
  }

  ${(properties) =>
    properties.isRtl === "rtl" &&
    css`
      text-align: right;
    `}
`;

export default StyledText;
