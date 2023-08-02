import AlternateButton from "./styles/alternate";

// eslint-disable-next-line functional/no-mixed-types
interface CopyButtonProperties {
  disabled: boolean;
  onClick: () => void;
}

/**
 *
 * @param root0 - Button props
 */
function CopyButton({ onClick, disabled }: CopyButtonProperties) {
  return (
    <AlternateButton onClick={onClick} disabled={disabled} tooltip="&#x1F4CB;">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeWidth="1"
        width="50"
        height="50"
      >
        <rect
          x="6"
          y="4"
          width="9"
          height="13"
          fill={disabled ? "whitesmoke" : "white"}
        />
        <rect
          x="9"
          y="7"
          width="9"
          height="13"
          fill={disabled ? "whitesmoke" : "white"}
        />
      </svg>
    </AlternateButton>
  );
}

export default CopyButton;
