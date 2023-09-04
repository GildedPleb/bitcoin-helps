import { css } from "@emotion/react";
import styled from "@emotion/styled";

import fadeIn from "../../../styles/fade-in";
import { type LeftToRightOrRightToLeft } from "../../../types";
import { FADE_IN_OUT } from "../../../utilities/constants";

const SubTitle = styled.h2<{ direction: LeftToRightOrRightToLeft }>`
  animation: ${fadeIn} ${FADE_IN_OUT / 1000}s forwards;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  max-width: 650px;
  line-height: 1.5;
  padding: 0 2rem;
  font-weight: 100;

  ${(properties) =>
    properties.direction === "rtl" &&
    css`
      text-align: right;
    `}
`;

export default SubTitle;
