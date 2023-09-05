import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useCallback, useState } from "react";
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
  const cloneGroups = JSON.parse(JSON.stringify(groups)) as GroupType[];
  for (const group of cloneGroups)
    group.options.sort((a: OptionType, b: OptionType) =>
      a.label.localeCompare(b.label)
    );
  cloneGroups.sort((a, b) => a.label.localeCompare(b.label));
  return cloneGroups;
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
  const { setIsLoading, setLoadingText, isLoading } = useLoading();
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
              onChange={setAffiliation}
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
              onChange={setIssue}
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
