import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";

import fadeIn from "../../../styles/fade-in";
import fadeOut from "../../../styles/fade-out";
import { type LeftToRightOrRightToLeft } from "../../../types";
import { FADE_IN_OUT } from "../../../utilities/constants";

interface LoadingInterface {
  small?: boolean | string;
  rightToLeft: LeftToRightOrRightToLeft;
  text?: string;
  interval?: number;
  willUnmount?: boolean;
}

const Loading = styled.div<{ small: boolean | string }>`
  width: 100%;
  height: 8vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  ${(properties) =>
    typeof properties.small === "boolean"
      ? css`
          max-height: 0px;
          margin: 0;
          padding: 0;
        `
      : css`
          max-height: ${properties.small};
          margin: 0;
          padding: 0;
        `}
`;

const Dot = styled.div<{ fadeInDelay: number; fadeOutDelay: number }>`
  background: black;
  border-radius: 50%;
  width: 5px;
  height: 5px;
  margin: 0 5px;
  opacity: 0;

  animation: ${fadeIn} 1s ${(properties) => properties.fadeInDelay}s forwards,
    ${fadeOut} 1.5s ${(properties) => properties.fadeOutDelay}s forwards;
`;

const Letter = styled.span<{ fadeInDelay: number; fadeOutDelay: number }>`
  opacity: 0;
  margin: 0 5px;
  animation: ${fadeIn} 2s ${(properties) => properties.fadeInDelay}s forwards,
    ${fadeOut} 2s ${(properties) => properties.fadeOutDelay}s forwards;
`;

const FadeOut = styled.div<{ willUnmount: boolean }>`
  ${(properties) =>
    properties.willUnmount
      ? css`
          animation: ${fadeOut} ${FADE_IN_OUT / 1000}s forwards;
        `
      : ""}
`;

/**
 *
 * @param root0 - Props
 */
function LoadingDots({
  small = false,
  text = "",
  rightToLeft,
  interval = 3,
  willUnmount = false,
}: LoadingInterface) {
  const [phase, setPhaseIndex] = useState(0);
  const [uniqueId, setUniqueId] = useState(0);
  const [displayedText, setDisplayedText] = useState(text);

  useEffect(() => {
    const timer = setInterval(() => {
      if (phase === 0 && text !== displayedText) setDisplayedText(text);
      setPhaseIndex((previousIndex) =>
        displayedText === "" ? 0 : (previousIndex + 1) % 4
      );
      setUniqueId((previousId) => previousId + 1);
    }, interval * 1000);

    return () => {
      clearInterval(timer);
    };
  }, [interval, phase, displayedText, text]);

  const words = displayedText.split(" ");

  const { length } = words;

  return (
    <FadeOut willUnmount={willUnmount}>
      <Loading small={small}>
        {phase === 0 &&
          Array.from({ length: 3 }).map((_, index) => (
            <Dot
              // eslint-disable-next-line react/no-array-index-key
              key={`${uniqueId}-${index}`}
              fadeInDelay={(rightToLeft === "rtl" ? 2 - index : index) / 3} // FadeIn during the first 3 seconds
              fadeOutDelay={(rightToLeft === "rtl" ? 2 - index : index) / 3 + 2} // FadeOut between 3-6 seconds
            />
          ))}
        {phase !== 0 &&
          words.map((letter, index) => (
            <Letter
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              fadeInDelay={
                ((rightToLeft === "rtl" ? length - 1 - index : index) /
                  length) *
                2
              }
              fadeOutDelay={
                ((rightToLeft === "rtl" ? length - 1 - index : index) /
                  length) *
                  2 +
                6.5
              }
            >
              {letter}
            </Letter>
          ))}
      </Loading>
    </FadeOut>
  );
}

export default LoadingDots;
