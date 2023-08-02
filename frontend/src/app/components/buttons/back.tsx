import MinimalButton from "./styles/minimal";

interface BackButtonProperties {
  onClick: () => void;
}

/**
 *
 * @param root0 - Button props
 */
function BackButton({ onClick }: BackButtonProperties) {
  return (
    <MinimalButton onClick={onClick} tooltip="&#x2B05;">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeWidth="1"
        width="50"
        height="50"
      >
        <path d="M19 12H6M9.5 9l-3.5 3 3.5 3" />
      </svg>
    </MinimalButton>
  );
}

export default BackButton;
