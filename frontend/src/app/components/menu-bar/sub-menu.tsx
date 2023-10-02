import styled from "@emotion/styled";

import fadeIn from "../../../styles/fade-in";
import { FADE_IN_OUT } from "../../../utilities/constants";
import FlagButton from "../buttons/flag";
import HeartButton from "../buttons/heart";

interface MenuBarProperties {
  onFlag: () => void;
  onCopy: () => void;
  disliked: boolean;
  liked: boolean;
  dislikeLoading: boolean;
  likeLoading: boolean;
  disabled: boolean;
}

const Container = styled.div`
  width: 100vw;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  position: relative;
  max-width: 650px;
  animation: ${fadeIn} ${FADE_IN_OUT / 1000}s forwards;
`;

const Options = styled.div`
  display: flex;
  gap: 10px;
`;

/**
 *
 * @param root0 - Props
 */
function SubMenuBar({
  onFlag,
  disliked,
  liked,
  dislikeLoading,
  likeLoading,
  onCopy,
  disabled,
}: MenuBarProperties) {
  return (
    !disabled && (
      <Container>
        <div />
        <Options>
          <HeartButton
            onClick={onCopy}
            liked={liked}
            disabled={disabled}
            loading={likeLoading}
          />
          <FlagButton
            onClick={onFlag}
            disliked={disliked}
            loading={dislikeLoading}
            disabled={disabled}
          />
        </Options>
      </Container>
    )
  );
}

export default SubMenuBar;
