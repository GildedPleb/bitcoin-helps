import styled from "@emotion/styled";

import MinimalButton from "./minimal";

const AlternateButton = styled(MinimalButton)`
  border: 2px solid transparent;
  z-index: 10;
  background: radial-gradient(circle, white 40%, transparent 100%);
  &:hover {
    border: 2px solid orange;
  }
  &:focus {
    outline: none;
    border: 2px solid #2684ff;
  }
`;

export default AlternateButton;
