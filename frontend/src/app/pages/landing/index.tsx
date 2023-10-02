import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const cloneGroups = JSON.parse(JSON.stringify(groups)) as GroupType[];
  for (const group of cloneGroups)
    group.options.sort((a: OptionType, b: OptionType) =>
      a.label.localeCompare(b.label)
    );
  cloneGroups.sort((a, b) => a.label.localeCompare(b.label));
  return cloneGroups;
};

const findOptionById = (
  groups: GroupType[] | undefined,
  id: string | null | undefined
): OptionTypeMapped | undefined => {
  if (!groups || id === undefined || id === null || id === "") return undefined;
  for (const group of groups)
    for (const option of group.options)
      if (option.value === id) return { ...option };

  return undefined;
};

const findOptionByName = (
  groups: GroupType[] | undefined,
  name: string | null | undefined
): OptionTypeMapped | undefined => {
  if (!groups || name === undefined || name === null || name === "")
    return undefined;
  for (const group of groups)
    for (const option of group.options)
      if (option.label.toLowerCase() === name.toLowerCase())
        return { ...option };

  return undefined;
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
 * @param root0 - props
 */
function LandingPage({
  setFirstLoad,
  firstLoad,
}: {
  setFirstLoad: React.Dispatch<React.SetStateAction<boolean>>;
  firstLoad: boolean;
}) {
  const [willUnmount, setWillUnmount] = useState(false);
  const { setIsLoading, setLoadingText, isLoading } = useLoading();

  const navigate = useNavigate();
  const location = useLocation();
  const {
    language,
    languages,
    setLanguage,
    loading: languageLoading,
  } = useLanguage();
  const queryParameters = new URLSearchParams(window.location.search);

  const queryAff = queryParameters.get("a") ?? undefined;
  const queryIss = queryParameters.get("i") ?? undefined;

  const [affiliation, setAffiliation] = useState<
    OptionTypeMapped | undefined
  >();
  const [issue, setIssue] = useState<OptionTypeMapped | undefined>();
  const [getArgumentId, { error: searchError }] = useGetArgumentIdLazyQuery({
    variables: {
      issueId: issue?.value ?? "",
      affiliationId: affiliation?.value ?? "",
      languageId: language.id ?? "",
    },
  });

  useEffect(() => {
    if (firstLoad) {
      const foundAff =
        findOptionById(language.affiliationTypes, language.selectedAffId) ??
        findOptionByName(language.affiliationTypes, queryAff);
      const foundIss =
        findOptionById(language.issueCategories, language.selectedIssId) ??
        findOptionByName(language.issueCategories, queryIss);

      setAffiliation(foundAff);
      setIssue(foundIss);
      if (foundIss ?? foundAff) setFirstLoad(false);
    }
    return () => {};
  }, [
    firstLoad,
    language.affiliationTypes,
    language.issueCategories,
    language.selectedAffId,
    language.selectedIssId,
    queryAff,
    queryIss,
    setFirstLoad,
  ]);

  const handleLanguageChange = useCallback(
    (option: LanguageOptionType | null) => {
      if (option !== null && option.label !== language.label) {
        setLanguage(option);
        // eslint-disable-next-line unicorn/no-useless-undefined
        setAffiliation(undefined);
        // eslint-disable-next-line unicorn/no-useless-undefined
        setIssue(undefined);
        navigate(`/${option.value}`);
      }
    },
    [language.label, navigate, setLanguage]
  );

  const handleGoButtonClick = useCallback(async () => {
    if (affiliation && issue) {
      setWillUnmount(true);
      setLoadingText(language.translations?.curatingContent);

      setIsLoading(true);
      const result = await getArgumentId();
      if (result.data?.getArgumentId?.id !== undefined) {
        const { id } = result.data.getArgumentId;
        setTimeout(() => {
          navigate(`/${language.value}/${id}`);
          // eslint-disable-next-line unicorn/no-useless-undefined
          setAffiliation(undefined);
          // eslint-disable-next-line unicorn/no-useless-undefined
          setIssue(undefined);
        }, FADE_IN_OUT);
      }
    }
  }, [
    affiliation,
    getArgumentId,
    issue,
    language.translations?.curatingContent,
    language.value,
    navigate,
    setIsLoading,
    setLoadingText,
  ]);

  const handleAffiliationChange = useCallback(
    (newAffiliation: OptionTypeMapped | undefined) => {
      if (newAffiliation) {
        const searchParameters = new URLSearchParams(location.search);
        searchParameters.set("a", newAffiliation.label);
        navigate({
          pathname: location.pathname,
          search: searchParameters.toString(),
        });
        setAffiliation(newAffiliation);
      }
    },
    [location.pathname, location.search, navigate]
  );

  const handleIssueChange = useCallback(
    (newIssue: OptionTypeMapped | undefined) => {
      if (newIssue) {
        const searchParameters = new URLSearchParams(location.search);
        searchParameters.set("i", newIssue.label);
        navigate({
          pathname: location.pathname,
          search: searchParameters.toString(),
        });
        setIssue(newIssue);
      }
    },
    [location.pathname, location.search, navigate]
  );

  if (searchError) {
    console.error(searchError);
    return <div />;
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
      !isLoading &&
      language.affiliationTypes &&
      language.issueCategories ? (
        <>
          <Sentence direction={language.direction} fadeIn>
            {language.translations?.iAmAffiliatedWith}
            <Selector
              language={language}
              value={affiliation}
              onChange={handleAffiliationChange}
              options={sortGroups(language.affiliationTypes)}
              placeholder={language.translations?.selectAffiliation}
              selectorKey={1}
            />
          </Sentence>
          <Sentence direction={language.direction} fadeIn>
            {language.translations?.andICareAbout}
            <Selector
              language={language}
              value={issue}
              onChange={handleIssueChange}
              options={sortGroups(language.issueCategories)}
              placeholder={language.translations?.selectIssue}
              selectorKey={2}
            />
          </Sentence>
          <GoButton
            onClick={handleGoButtonClick}
            disabled={!affiliation || !issue || willUnmount}
            text={language.translations?.whyCare}
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
