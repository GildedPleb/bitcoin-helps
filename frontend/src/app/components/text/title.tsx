import { css } from "@emotion/react";
import styled from "@emotion/styled";

import fadeIn from "../../../styles/fade-in";
import { type LeftToRightOrRightToLeft } from "../../../types";
import { FADE_IN_OUT } from "../../../utilities/constants";

const Title = styled.h1<{ direction: LeftToRightOrRightToLeft }>`
  animation: ${fadeIn} ${FADE_IN_OUT / 1000}s forwards;
  font-size: clamp(1.75rem, 5.5vw, 3.75rem);
  font-weight: bold;
  max-width: 650px;
  min-height: 80px;
  line-height: 1.5;

  padding-right: clamp(50px, 30%, 250px);
  padding-left: 2rem;
  overflow: hidden;

  ${(properties) =>
    properties.direction === "rtl" &&
    css`
      text-align: right;
      padding-right: 2rem;
      padding-left: clamp(50px, 30%, 250px);
    `}
`;

export default Title;
