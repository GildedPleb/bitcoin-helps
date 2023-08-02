import styled from "@emotion/styled";

import { type LeftToRightOrRightToLeft } from "../../../types";
import BackButton from "../buttons/back";
import FlagButton from "../buttons/flag";
import HeartButton from "../buttons/heart";
import LinkButton from "../buttons/link";

interface MenuBarProperties {
  onGoBack: () => void;
  onFlag: () => void;
  onCopy: () => void;
  onLink: () => void;
  disliked: boolean;
  liked: boolean;
  dislikeLoading: boolean;
  likeLoading: boolean;
  isRtl: LeftToRightOrRightToLeft;
  disabled: boolean;
}

const Container = styled.div`
  min-width: calc(100vw - 6em);
  display: flex;
  justify-content: space-between;
  padding: 0 2em;
  gap: 10px;
  margin-top: 5vh;
`;

const Options = styled.div`
  display: flex;
  gap: 10px;
`;

/**
 *
 * @param root0 - Props
 */
function MenuBar({
  onGoBack,
  onFlag,
  disliked,
  liked,
  dislikeLoading,
  likeLoading,
  onCopy,
  onLink,
  isRtl,
  disabled,
}: MenuBarProperties) {
  return (
    <Container>
      <BackButton onClick={onGoBack} />
      <Options>
        <HeartButton
          onClick={onCopy}
          liked={liked}
          disabled={disabled}
          loading={likeLoading}
          isRtl={isRtl}
        />
        <FlagButton
          onClick={onFlag}
          disliked={disliked}
          loading={dislikeLoading}
          isRtl={isRtl}
          disabled={disabled}
        />
        <LinkButton onClick={onLink} />
      </Options>
    </Container>
  );
}

export default MenuBar;
