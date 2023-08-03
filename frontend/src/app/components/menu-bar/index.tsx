import styled from "@emotion/styled";
import React, { useCallback, useState } from "react";

import { type LeftToRightOrRightToLeft } from "../../../types";
import { FADE_IN_OUT } from "../../../utilities/constants";
import BackButton from "../buttons/back";
import FlagButton from "../buttons/flag";
import HeartButton from "../buttons/heart";
import LinkButton from "../buttons/link";
import DropDown from "./drop-down";

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
  const [isShareMenuShown, setIsShareMenuShown] = useState(false);
  const [willUnmount, setWillUnmount] = useState(false);

  const toggleShareMenu = useCallback(
    (event?: React.MouseEvent | React.KeyboardEvent) => {
      if (
        event &&
        (event.type === "click" ||
          (event.type === "keyup" && "key" in event && event.key === "Enter"))
      ) {
        if (isShareMenuShown) {
          setWillUnmount(true);
          setTimeout(() => {
            setIsShareMenuShown(!isShareMenuShown);
            setWillUnmount(false);
          }, FADE_IN_OUT);
        } else {
          setIsShareMenuShown(!isShareMenuShown);
        }
      }
    },
    [isShareMenuShown]
  );

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
        <LinkButton onClick={toggleShareMenu} />
        <DropDown
          isShown={isShareMenuShown}
          willUnmount={willUnmount}
          onCopy={onLink}
        />
      </Options>
    </Container>
  );
}

export default MenuBar;
