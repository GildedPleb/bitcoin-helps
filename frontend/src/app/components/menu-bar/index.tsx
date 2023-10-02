import styled from "@emotion/styled";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { type LeftToRightOrRightToLeft } from "../../../types";
import { FADE_IN_OUT } from "../../../utilities/constants";
import BackButton from "../buttons/back";
import LinkButton from "../buttons/link";
import DropDown from "./drop-down";

interface MenuBarProperties {
  onGoBack: () => void;
  onLink: () => void;
  onCopyText: () => void;
  title: string;
  subtitle: string;
  direction: LeftToRightOrRightToLeft;
}

const Container = styled.div<{ direction: LeftToRightOrRightToLeft }>`
  width: 100vw;
  max-width: 900px;
  display: flex;
  flex-direction: ${(properties) =>
    properties.direction === "ltr" ? "row" : "row-reverse"};
  justify-content: space-between;
  padding: 1rem 2rem;
  gap: 10px;
  z-index: 10;
  position: fixed;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-end;
    max-width: 650px;
  }
`;

const MenuContainer = styled.div`
  position: relative;
`;

/**
 *
 * @param root0 - Props
 */
function MenuBar({
  onGoBack,
  onLink,
  onCopyText,
  title,
  subtitle,
  direction,
}: MenuBarProperties) {
  const [isShareMenuShown, setIsShareMenuShown] = useState(false);
  const [isShareMenuShownForClicks, setIsShareMenuShownForClicks] =
    useState(false);
  const [willUnmount, setWillUnmount] = useState(false);
  const dropdownReference = useRef<HTMLDivElement>(null);

  // Handle click outside of the dropdown
  const handleClickOutside = useCallback(
    (event: Event) => {
      const targetElement = event.target as HTMLElement;

      if (
        dropdownReference.current &&
        !dropdownReference.current.contains(targetElement) &&
        isShareMenuShown &&
        isShareMenuShownForClicks
      ) {
        setWillUnmount(true);
        setTimeout(() => {
          setIsShareMenuShown(!isShareMenuShown);
          setWillUnmount(false);
          setIsShareMenuShownForClicks(false);
        }, FADE_IN_OUT);
      }
    },
    [isShareMenuShown, isShareMenuShownForClicks]
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

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
          setTimeout(() => {
            setIsShareMenuShownForClicks(true);
          }, FADE_IN_OUT);
        }
      }
    },
    [isShareMenuShown]
  );

  return (
    <Container direction={direction}>
      <BackButton onClick={onGoBack} />
      <MenuContainer>
        <LinkButton onClick={toggleShareMenu} />
        <DropDown
          ref={dropdownReference}
          isShown={isShareMenuShown}
          willUnmount={willUnmount}
          onCopyLink={onLink}
          onCopyText={onCopyText}
          title={title}
          subtitle={subtitle}
        />
      </MenuContainer>
    </Container>
  );
}

export default MenuBar;
