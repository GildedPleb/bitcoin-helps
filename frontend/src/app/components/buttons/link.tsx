import React from "react";

import AlternateButton from "./styles/alternate";

interface LinkButtonProperties {
  onClick: (event?: React.MouseEvent | React.KeyboardEvent) => void;
}

/**
 *
 * @param root0 - Button props
 */
function LinkButton({ onClick }: LinkButtonProperties) {
  return (
    <AlternateButton onClick={onClick} tooltip="&#x1F517;">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeWidth="1"
        width="50"
        height="50"
      >
        <path transform="translate(3, -.9)" d="M3 20 C 3 7, 16 10, 15 10" />
        <path transform="translate(0, -3)" d="M14.5 9l3.5 3-3.5 3" />
      </svg>
    </AlternateButton>
  );
}

export default LinkButton;
