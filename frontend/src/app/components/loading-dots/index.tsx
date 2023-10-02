import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import fadeIn from "../../../styles/fade-in";
import fadeOut from "../../../styles/fade-out";
import { FADE_IN_OUT } from "../../../utilities/constants";

interface LoadingInterface {
  small?: boolean | string;
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

const Dot = styled.div<{
  fadeInDelay: number;
  fadeOutDelay: number;
  small: boolean;
}>`
  background: black;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  margin: 0 10px;
  opacity: 0;
  ${(properties) =>
    typeof properties.small === "boolean" && properties.small
      ? css`
          width: 5px;
          height: 5px;
          margin: 0 5px;
        `
      : ""}

  animation: ${fadeIn} 1s ${(properties) => properties.fadeInDelay}s forwards,
    ${fadeOut} 1.5s ${(properties) => properties.fadeOutDelay}s forwards;
`;

const LetterContainer = styled.span`
  position: relative;
  display: inline-block;
`;

const Letter = styled.span<{
  fadeInDelay: number;
  fadeOutDelay: number;
  children: string;
}>`
  position: relative;
  font-size: clamp(1.1rem, 3.5vw, 2rem);
  opacity: 0;
  margin: 0 0px;
  animation: ${fadeIn} 2s ${(properties) => properties.fadeInDelay}s forwards,
    ${fadeOut} 2s ${(properties) => properties.fadeOutDelay}s forwards;
  z-index: 10;
  color: black;
`;

const Shadow = styled.span<{
  fadeInDelay: number;
  fadeOutDelay: number;
  children: string;
}>`
  position: absolute;
  left: 0;
  top: 0;
  font-size: clamp(1.1rem, 3.5vw, 2rem);
  opacity: 0;
  margin: 0 1px;
  animation: ${fadeIn} 2s ${(properties) => properties.fadeInDelay}s forwards,
    ${fadeOut} 2s ${(properties) => properties.fadeOutDelay}s forwards;
  z-index: 0;
  color: transparent;
  text-shadow: 4px 4px 10px white, -4px -4px 10px white, 4px -4px 10px white,
    -4px 4px 10px white, 0px 0px 15px white, 0px 4px 10px white,
    0px -4px 10px white, 4px 0px 10px white, -4px 0px 10px white,
    2px 2px 5px white, -2px -2px 5px white, 2px -2px 5px white,
    -2px 2px 5px white, 8px 8px 20px white, -8px -8px 20px white,
    8px -8px 20px white, -8px 8px 20px white, 0px 0px 30px white,
    0px 8px 20px white, 0px -8px 20px white, 8px 0px 20px white,
    -8px 0px 20px white, 4px 4px 20px white, -4px -4px 20px white,
    4px -4px 20px white, -4px 4px 20px white, 0px 0px 25px white;
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

  const words = [...displayedText];

  const { length } = words;

  return (
    <FadeOut willUnmount={willUnmount}>
      <Loading small={small}>
        {phase === 0 &&
          Array.from({ length: 3 }).map((_, index) => (
            <Dot
              // eslint-disable-next-line react/no-array-index-key
              key={`${uniqueId}-${index}`}
              fadeInDelay={index / 3}
              fadeOutDelay={index / 3 + 2}
              small={Boolean(small)}
            />
          ))}
        {phase !== 0 &&
          words.map((letter, index) => {
            const fadeInDelay = (index / length) * 2;
            const fadeOutDelay = (index / length) * 2 + 6;
            const char = letter === " " ? "\u00A0" : letter;
            return (
              // eslint-disable-next-line react/no-array-index-key
              <LetterContainer key={index}>
                <Letter fadeInDelay={fadeInDelay} fadeOutDelay={fadeOutDelay}>
                  {char}
                </Letter>
                <Shadow fadeInDelay={fadeInDelay} fadeOutDelay={fadeOutDelay}>
                  {char}
                </Shadow>
              </LetterContainer>
            );
          })}
      </Loading>
    </FadeOut>
  );
}

export default LoadingDots;
