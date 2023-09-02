import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import fadeIn from "../../../styles/fade-in";
import fadeOut from "../../../styles/fade-out";
import { FADE_IN_OUT } from "../../../utilities/constants";

const Container = styled.section<{ fadingOut: boolean }>`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  pointer-events: none;
  ${(properties) =>
    properties.fadingOut &&
    css`
      animation: ${fadeOut} ${FADE_IN_OUT / 1000}s forwards;
    `}
`;

const CountdownText = styled.div<{ visible: boolean }>`
  opacity: 0;
  color: transparent;
  ${(properties) =>
    properties.visible &&
    css`
      animation: ${fadeIn} ${FADE_IN_OUT / 1000}s forwards;
      color: black;
    `}
`;

/**
 *
 * @param root0 - Props
 */
function Countdown({
  targetDate,
  locale,
  willUnmount,
}: {
  targetDate: string;
  locale: string;
  willUnmount: boolean;
}) {
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = new Date(Number(targetDate)).getTime() - now.getTime();

      if (difference < 0) {
        clearInterval(interval);
        setCountdown("");
        return;
      }

      const seconds = Math.floor((difference / 1000) % 60);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));

      const components = [
        days > 0 ? `${days.toString()}:` : "",
        hours > 0 ? `${hours.toString().padStart(2, "0")}:` : "00:",
        minutes > 0 ? `${minutes.toString().padStart(2, "0")}:` : "00:",
        seconds >= 0 ? `${seconds.toString().padStart(2, "0")}` : "00",
      ].filter(Boolean);

      setCountdown(components.join(""));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [targetDate, locale]);

  return (
    <Container fadingOut={willUnmount}>
      <CountdownText visible={countdown !== ""}>
        {countdown === "" ? ":" : countdown}
      </CountdownText>
    </Container>
  );
}

export default Countdown;
