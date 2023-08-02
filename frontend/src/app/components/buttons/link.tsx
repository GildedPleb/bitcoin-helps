import AlternateButton from "./styles/alternate";

interface LinkButtonProperties {
  onClick: () => void;
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
        <g transform="rotate(-45 12 12) translate(-1, -1)">
          <path d="M6 14a5 2.5 0 0 1 10 0a5 2.5 0 0 1 -10 0z" />
          <path d="M11 12a5 2.5 0 0 1 10 0a5 2.5 0 0 1 -10 0z" />
        </g>
      </svg>
    </AlternateButton>
  );
}

export default LinkButton;
