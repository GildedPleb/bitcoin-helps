import styled from "@emotion/styled";

import MinimalButton from "./minimal";

const AlternateButton = styled(MinimalButton)`
  border: 2px solid transparent;
  z-index: 10;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 1) 20%,
    rgba(255, 255, 255, 0.45) 60%,
    rgba(255, 255, 255, 0.01) 80%,
    transparent 100%
  );
  &:hover {
    border: 2px solid orange;
  }
  &:focus {
    outline: none;
    border: 2px solid #2684ff;
  }
`;

export default AlternateButton;
