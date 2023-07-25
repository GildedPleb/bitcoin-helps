import styled from "@emotion/styled";

import { type LeftToRightOrRightToLeft } from "../../../types";
import BackButton from "../buttons/back";
import CopyButton from "../buttons/copy";
import FlagButton from "../buttons/flag";
import LinkButton from "../buttons/link";

interface MenuBarProperties {
  onGoBack: () => void;
  onFlag: () => void;
  onCopy: () => void;
  onLink: () => void;
  disliked: boolean;
  dislikeLoading: boolean;
  isRtl: LeftToRightOrRightToLeft;
}

const Container = styled.div`
  min-width: calc(100vw - 6em);
  display: flex;
  justify-content: space-between;
  padding: 0 2em;
  gap: 10px;
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
  dislikeLoading,
  onCopy,
  onLink,
  isRtl,
}: MenuBarProperties) {
  return (
    <Container>
      <BackButton onClick={onGoBack} />
      <Options>
        <FlagButton
          onClick={onFlag}
          disliked={disliked}
          loading={dislikeLoading}
          isRtl={isRtl}
        />
        <CopyButton onClick={onCopy} />
        <LinkButton onClick={onLink} />
      </Options>
    </Container>
  );
}

export default MenuBar;
