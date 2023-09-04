import styled from "@emotion/styled";

import fadeIn from "../../../styles/fade-in";
import { FADE_IN_OUT } from "../../../utilities/constants";

const StyledText = styled.div`
  display: flex;
  justify-content: center;
  gap: 5vh;

  animation: ${fadeIn} ${FADE_IN_OUT / 1000}s forwards;
`;

export default StyledText;
