import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  type GroupType,
  type OptionType,
  useGetArgumentIdLazyQuery,
} from "../../../graphql/generated";
import { useLanguage } from "../../../providers/language";
import { type LanguageOptionType } from "../../../providers/language/types";
import { useLoading } from "../../../providers/loading";
import fadeOut from "../../../styles/fade-out";
import { type LeftToRightOrRightToLeft } from "../../../types";
import { FADE_IN_OUT } from "../../../utilities/constants";
import { GoButton, Selector, Sentence, Spacer } from "../../components";

export interface OptionTypeMapped extends OptionType {
  direction?: LeftToRightOrRightToLeft;
}

const sortGroups = (groups: GroupType[]): GroupType[] => {
  for (const group of groups)
    group.options.sort((a, b) => a.label.localeCompare(b.label));

  groups.sort((a, b) => a.label.localeCompare(b.label));

  return groups;
};

const Container = styled.section<{ willUnmount: boolean }>`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: space-around;
  padding-top: 8vh;
  padding-bottom: 8vh;
  transition: all 0.2s;
  ${({ willUnmount }) =>
    willUnmount
      ? css`
          animation: ${fadeOut} ${FADE_IN_OUT / 1000}s forwards;
        `
      : ""}
`;

/**
 *
 */
function LandingPage() {
  const [willUnmount, setWillUnmount] = useState(false);
  const { setIsLoading, setLoadingText } = useLoading();
  const [affiliation, setAffiliation] = useState<OptionTypeMapped>();
  const [issue, setIssue] = useState<OptionTypeMapped>();

  const navigate = useNavigate();
  const {
    language,
    languages,
    setLanguage,
    loading: languageLoading,
  } = useLanguage();
  const [getArgumentId, { error: searchError }] = useGetArgumentIdLazyQuery({
    variables: {
      issueId: issue?.value ?? "",
      affiliationId: affiliation?.value ?? "",
      languageId: language.id ?? "",
    },
  });

  const handleLanguageChange = useCallback(
    (option: LanguageOptionType | null) => {
      if (option !== null && option.label !== language.label) {
        setLanguage(option);
        // eslint-disable-next-line unicorn/no-useless-undefined
        setAffiliation(undefined);
        // eslint-disable-next-line unicorn/no-useless-undefined
        setIssue(undefined);
      }
    },
    [language, setLanguage]
  );

  const handleGoButtonClick = useCallback(async () => {
    if (affiliation && issue) {
      setWillUnmount(true);
      setLoadingText(language.findingArgument);
      setIsLoading(true);
      const result = await getArgumentId();
      if (result.data?.getArgumentId?.id !== undefined) {
        const { id } = result.data.getArgumentId;
        setTimeout(() => {
          navigate(`/${id}`);
        }, FADE_IN_OUT);
      }
    }
  }, [
    affiliation,
    getArgumentId,
    issue,
    language.findingArgument,
    navigate,
    setIsLoading,
    setLoadingText,
  ]);

  useEffect(() => {
    if (languageLoading) {
      setIsLoading(true);
      setLoadingText(language.loading);
    } else {
      setIsLoading(false);
    }
  }, [languageLoading, setIsLoading, setLoadingText, language.loading]);

  if (searchError) {
    console.error(searchError);
    return <p>Error Search :( REKT</p>;
  }

  const sortedLanguageOptions = languages.sort((a, b) =>
    a.value > b.value ? 1 : -1
  );

  return (
    <Container willUnmount={willUnmount}>
      <Sentence direction={language.direction} fadeIn>
        {language.speak}
        <Selector
          language={language}
          value={language}
          onChange={handleLanguageChange}
          options={sortedLanguageOptions}
          selectorKey={0}
        />
      </Sentence>
      {!languageLoading &&
      language.affiliationTypes &&
      language.issueCategories ? (
        <>
          <Sentence direction={language.direction} fadeIn>
            {language.iAmAffiliatedWith}
            <Selector
              language={language}
              value={affiliation}
              onChange={setAffiliation}
              options={sortGroups(language.affiliationTypes)}
              placeholder={language.selectAffiliation}
              selectorKey={1}
            />
          </Sentence>
          <Sentence direction={language.direction} fadeIn>
            {language.andICareAbout}
            <Selector
              language={language}
              value={issue}
              onChange={setIssue}
              options={sortGroups(language.issueCategories)}
              placeholder={language.selectIssue}
              selectorKey={2}
            />
          </Sentence>
          <GoButton
            onClick={handleGoButtonClick}
            disabled={!affiliation || !issue}
            text={language.whyCare}
          />
        </>
      ) : (
        <>
          <Spacer />
          <Spacer />
          <Spacer />
        </>
      )}
    </Container>
  );
}

export default LandingPage;
