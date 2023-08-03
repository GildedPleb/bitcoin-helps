import styled from "@emotion/styled";
import React, { type ReactNode, useCallback } from "react";

import fadeIn from "../../../../styles/fade-in";
import { FADE_IN_OUT } from "../../../../utilities/constants";

const StyledButton = styled.button`
  background: none;
  border: 2px solid black;
  margin: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  height: 8vh;
  min-height: 2em;
  font-size: clamp(1.1rem, 3.5vw, 2rem);
  padding: 0 1.75em;
  background-color: white;
  border-radius: 3em;
  vertical-align: center;
  z-index: 0;
  transition: all 0.3s;
  animation: ${fadeIn} ${FADE_IN_OUT / 1000}s ease;
  line-height: 1.5;
  color: black;

  &:disabled {
    background-color: whitesmoke;
    cursor: default;
    border: none;
    pointer-events: none;
  }

  &:hover {
    border-color: orange;
  }

  &:active {
    background-color: orange;
    outline: none;
    border-color: none;
  }

  &:focus {
    outline: none;
    border-color: #2684ff;
    border-radius: 3em;
    color: black;
  }
`;

interface ButtonProperties {
  onClick: (event?: React.MouseEvent | React.KeyboardEvent) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  tooltip: string;
}

/**
 *
 * @param root0 - Props
 */
function MyButton({
  onClick,
  children,
  disabled = false,
  className = "",
  tooltip,
}: ButtonProperties) {
  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> =
    useCallback(
      (event) => {
        if (event.key === "Enter") {
          onClick(event);
        }
      },
      [onClick]
    );

  return (
    <StyledButton
      className={className}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onClick={onClick}
      type="button"
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
    >
      {children}
    </StyledButton>
  );
}

export default MyButton;
