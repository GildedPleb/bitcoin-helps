import styled from "@emotion/styled";

import StyledButton from "./base";

const MinimalButton = styled(StyledButton)`
  width: 50px;
  height: 50px;
  min-width: 50px;
  min-height: 50px;
  font-size: 26px;
  padding: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
`;

export default MinimalButton;
