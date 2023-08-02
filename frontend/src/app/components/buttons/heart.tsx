import { type LeftToRightOrRightToLeft } from "../../../types";
import LoadingDots from "../loading-dots";
import AlternateButton from "./styles/alternate";

interface HeartButtonProperties {
  onClick: () => void;
  loading: boolean;
  liked: boolean;
  isRtl: LeftToRightOrRightToLeft;
  disabled: boolean;
}

/**
 *
 * @param root0 - Button props
 */
function HeartButton({
  onClick,
  loading,
  liked,
  isRtl,
  disabled,
}: HeartButtonProperties) {
  return (
    <AlternateButton
      onClick={onClick}
      disabled={loading || liked || disabled}
      tooltip="❤️"
    >
      {loading ? (
        <LoadingDots small rightToLeft={isRtl} />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="50"
          height="50"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            stroke="black"
            strokeWidth="1.4"
            fill={disabled ? "whitesmoke" : "red"}
            transform="scale(0.70) translate(5, 5)"
          />
        </svg>
      )}
    </AlternateButton>
  );
}

export default HeartButton;
