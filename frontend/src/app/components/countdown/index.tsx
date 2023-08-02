import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import fadeIn from "../../../styles/fade-in";
import fadeOut from "../../../styles/fade-out";

const Container = styled.section<{ fadingOut: boolean }>`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  position: fixed;
  font-size: clamp(1.1rem, 3.5vw, 2rem);
  pointer-events: none;
  ${(properties) =>
    properties.fadingOut &&
    css`
      animation: ${fadeOut} 1s 0s forwards;
    `}
`;

const CountdownText = styled.div<{ visible: boolean }>`
  opacity: 0;
  ${(properties) =>
    properties.visible &&
    css`
      animation: ${fadeIn} 0.3s 0s forwards;
      opacity: 1;
    `}
`;

/**
 *
 * @param root0 - Props
 */
function Countdown({
  targetDate,
  locale,
}: {
  targetDate: string;
  locale: string;
}) {
  const [countdown, setCountdown] = useState("");
  const [fadingOut, setFadingOut] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = new Date(Number(targetDate)).getTime() - now.getTime();

      if (difference < 0) {
        clearInterval(interval);
        setCountdown("");
        return;
      }

      if (difference <= 1000) setFadingOut(true);

      const seconds = Math.floor((difference / 1000) % 60);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));

      const components = [
        days > 0 ? `${days.toString().padStart(2, "0")}:` : "",
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
    <Container fadingOut={fadingOut}>
      <CountdownText visible={countdown !== ""}>{countdown}</CountdownText>
    </Container>
  );
}

export default Countdown;
