import React from "react";

import { type LeftToRightOrRightToLeft } from "../../../types";
import LoadingDots from "../loading-dots";
import AlternateButton from "./styles/alternate";

interface FlagButtonProperties {
  onClick: () => void;
  loading: boolean;
  disliked: boolean;
  isRtl: LeftToRightOrRightToLeft;
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
}: FlagButtonProperties) {
  return (
    <AlternateButton onClick={onClick} disabled={loading || disliked}>
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
            <path d="M9 6v12" stroke="black" strokeWidth="1" fill="none" />
            <path d="M9 6h8v6h-8z" stroke="black" strokeWidth="1" fill="red" />
          </svg>
        </>
      )}
    </AlternateButton>
  );
}

export default FlagButton;
