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
        strokeWidth="2"
        width="50"
        height="50"
      >
        <g transform="scale(.5) translate(11 18) rotate(-45 12 12)">
          <path d="M12 12 l-4 0 a4 4 0 0 1 0 -8 l8 0 q4 0 4 4" stroke="black" />
          <path
            d="M12 12 l-4 0 a4 4 0 0 1 0 -8 l8 0 q4 0 4 4"
            stroke="black"
            transform="translate(12, 12) rotate(180) translate(-22.5, -4)"
          />
        </g>
      </svg>
    </AlternateButton>
  );
}

export default LinkButton;
