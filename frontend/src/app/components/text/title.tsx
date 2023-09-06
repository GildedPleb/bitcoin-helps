import { css } from "@emotion/react";
import styled from "@emotion/styled";

import fadeIn from "../../../styles/fade-in";
import { type LeftToRightOrRightToLeft } from "../../../types";
import { FADE_IN_OUT } from "../../../utilities/constants";

const Title = styled.h1<{ direction: LeftToRightOrRightToLeft }>`
  animation: ${fadeIn} ${FADE_IN_OUT / 1000}s forwards;
  font-size: clamp(2.5rem, 5.5vw, 3.75rem);
  font-weight: bold;
  width: 100%;
  max-width: 650px;
  min-height: 120px;
  line-height: 1.5;

  padding-right: calc(20px + 32px + 50px);
  padding-left: 2rem;
  overflow: hidden;

  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  white-space: break-spaces;

  ${(properties) =>
    properties.direction === "rtl" &&
    css`
      text-align: right;
      padding-right: 2rem;
      padding-left: calc(20px + 32px + 50px);
    `}
  @media (min-width: 600px) {
    word-break: normal;
    hyphens: none;
  }
`;

export default Title;
