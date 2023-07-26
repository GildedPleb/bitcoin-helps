import { css } from "@emotion/react";
import styled from "@emotion/styled";

import fadeIn from "../../../styles/fade-in";
import { type LeftToRightOrRightToLeft } from "../../../types";
import { FADE_IN_OUT } from "../../../utilities/constants";

interface SentanceProperties {
  direction?: LeftToRightOrRightToLeft;
  fadeIn?: boolean;
}

const Sentence = styled.div<SentanceProperties>`
  display: flex;
  flex-direction: ${(properties) =>
    properties.direction === "ltr" ? "row" : "row-reverse"};
  align-items: center;
  font-size: clamp(1.1rem, 3.5vw, 2rem);
  text-align: center;
  line-height: 1.5;
  height: 8vh;
  min-height: 2em;

  ${(properties) =>
    properties.fadeIn !== undefined &&
    properties.fadeIn &&
    css`
      animation: ${fadeIn} ${FADE_IN_OUT / 1000}s ease;
    `};

  border: 1px solid red;
`;

export default Sentence;
