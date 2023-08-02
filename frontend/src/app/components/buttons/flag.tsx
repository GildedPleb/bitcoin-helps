import { type LeftToRightOrRightToLeft } from "../../../types";
import LoadingDots from "../loading-dots";
import AlternateButton from "./styles/alternate";

interface FlagButtonProperties {
  onClick: () => void;
  loading: boolean;
  disliked: boolean;
  isRtl: LeftToRightOrRightToLeft;
  disabled: boolean;
}

/**
 *
 * @param root0 - Button props
 */
function FlagButton({
  onClick,
  loading,
  disliked,
  isRtl,
  disabled,
}: FlagButtonProperties) {
  return (
    <AlternateButton
      onClick={onClick}
      disabled={loading || disliked || disabled}
      tooltip="❌"
    >
      {loading ? (
        <LoadingDots small rightToLeft={isRtl} />
      ) : (
        <>
          {/* &#x1F6A9; */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="50"
            height="50"
          >
            <g fill="none">
              <path
                d="M7 7 L17 17 M17 7 L7 17"
                stroke="black"
                strokeWidth="4"
              />
              <path
                d="M7.75 7.75 L16.25 16.25 M16.25 7.75 L7.75 16.25"
                stroke={disabled ? "whitesmoke" : "red"}
                strokeWidth="2"
              />
            </g>
          </svg>
        </>
      )}
    </AlternateButton>
  );
}

export default FlagButton;
