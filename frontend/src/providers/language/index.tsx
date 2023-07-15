import { useApolloClient } from "@apollo/client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type GetAfffiliationsAndIssuesQuery,
  useGetAfffiliationsAndIssuesQuery,
} from "../../graphql/generated";
import { type LeftToRightOrRightToLeft } from "../../types";
import {
  DEFAULT_LANGUAGE_STATUS,
  LANGUAGE_OPTIONS,
  RTL_LANGUAGES,
} from "./presets";
import { GET_AFFILIATIONS_ISSUES } from "./queries";
import {
  type LanguageContextProperties,
  type LanguageOptionType,
  type LanguageStatus,
} from "./types";

const DEFAULT_LANG = LANGUAGE_OPTIONS.find((item) => item.value === "en");
if (!DEFAULT_LANG) throw new Error("Make sure you have a default lang");

export const LanguageContext = createContext<LanguageContextProperties>({
  language: DEFAULT_LANG,
  languages: LANGUAGE_OPTIONS,
  setLanguage: () => {},
  browserLanguage: DEFAULT_LANG,
  loading: false,
});

const LANGUAGE_KEY = "ThisIsFixedlanguage";

export const isRtl = (code: string): LeftToRightOrRightToLeft =>
  RTL_LANGUAGES.some((rtlLang) => code.startsWith(rtlLang)) ? "rtl" : "ltr";

const populateLang = (code: string): LanguageOptionType => {
  const languageOption = LANGUAGE_OPTIONS.find((item) => item.value === code);
  if (languageOption) return languageOption;
  const display = new Intl.DisplayNames([code], { type: "language" });
  const languageDisplay = display.of(code);

  const extraValues = LANGUAGE_OPTIONS.find(
    (item) => item.value === code.split("-")[0]
  );

  const populated = extraValues
    ? {
        ...extraValues,
        value: code,
        ...(languageDisplay !== undefined && { label: languageDisplay }),
        direction: isRtl(code),
      }
    : {
        value: code,
        label:
          languageDisplay === undefined ? DEFAULT_LANG.label : languageDisplay,
        direction: isRtl(code),
        speak: DEFAULT_LANG.speak,
        loading: DEFAULT_LANG.loading,
        status: DEFAULT_LANGUAGE_STATUS,
      };
  return languageDisplay === undefined ? DEFAULT_LANG : populated;
};

/**
 * Language Context
 *
 * @param props - children
 */
function LanguageProvider({ children }: React.PropsWithChildren) {
  const previous = localStorage.getItem(LANGUAGE_KEY);
  const browserLanguage = populateLang(navigator.language);

  const defaultLanguage =
    previous === null
      ? browserLanguage
      : (JSON.parse(previous) as LanguageOptionType);

  const [language, setLanguage] = useState(defaultLanguage);
  const [languages, setLanguages] = useState([
    ...LANGUAGE_OPTIONS,
    browserLanguage,
  ]);
  const [initialLoading, setInitialLoading] = useState(true);

  const client = useApolloClient();

  const updateLanguageStatus = (
    languageValue: string,
    newStatus: LanguageStatus
  ) => {
    setLanguages((previousLanguages) =>
      previousLanguages.map((presetLanguage) =>
        presetLanguage.value === languageValue
          ? { ...presetLanguage, status: newStatus }
          : presetLanguage
      )
    );
  };

  const getFallbackLanguage = useCallback(
    (currentLang: string) => {
      const current = languages.find((lang) => lang.value === currentLang);

      if (current && current.value !== browserLanguage.value) {
        const bLang = languages.find(
          (lang) => lang.value === browserLanguage.value
        );
        if (bLang && bLang.status === "available") return bLang;
      }

      const simplifiedCurrentLang = currentLang.split("-")[0];
      const sLang = languages.find(
        (lang) => lang.value === simplifiedCurrentLang
      );
      if (sLang && sLang.status === "available") return sLang;

      const simplifiedBrowserLang = languages.find(
        (lang) => lang.value === browserLanguage.value.split("-")[0]
      );
      if (simplifiedBrowserLang && simplifiedBrowserLang.status === "available")
        return simplifiedBrowserLang;

      if (!DEFAULT_LANG)
        throw new Error("There should always be a default language");
      return DEFAULT_LANG;
    },
    [browserLanguage.value, languages]
  );

  const setLanguageAndTriggerLoad = useCallback(
    (newLanguage: LanguageOptionType) => {
      const langInLanguages = languages.find(
        (lang) => lang.value === newLanguage.value
      );

      if (langInLanguages && langInLanguages.status === "available")
        setLanguage(langInLanguages);
      else {
        updateLanguageStatus(newLanguage.value, "generating");
        const fallbackLanguage = getFallbackLanguage(newLanguage.value);
        setLanguage(fallbackLanguage);
      }
      setInitialLoading(true);
    },
    [getFallbackLanguage, languages]
  );

  useGetAfffiliationsAndIssuesQuery({
    variables: { language: `${language.value} (${language.label})` },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setInitialLoading(false);
      if (data.getAfffiliationsAndIssues) {
        updateLanguageStatus(language.value, "available");
        const { translations, affiliationTypes, issueCategories, id } =
          data.getAfffiliationsAndIssues;
        setLanguage((oldLang) => ({
          ...oldLang,
          ...translations,
          affiliationTypes,
          issueCategories,
          id,
        }));
      } else {
        updateLanguageStatus(language.value, "generating");
        const fallbackLanguage = getFallbackLanguage(language.value);
        setLanguageAndTriggerLoad(fallbackLanguage);
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    const generatingLanguages = languages.filter(
      (presetLanguage) => presetLanguage.status === "generating"
    );
    if (generatingLanguages.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const interval = setInterval(async () => {
        for await (const presetLanguage of generatingLanguages) {
          console.log("checking:", presetLanguage.value);
          const { data, loading, error } =
            await client.query<GetAfffiliationsAndIssuesQuery>({
              query: GET_AFFILIATIONS_ISSUES,
              variables: {
                language: `${presetLanguage.value} (${presetLanguage.label})`,
              },
              fetchPolicy: "network-only",
            });
          if (error) console.error(error);
          if (!loading && !error && data.getAfffiliationsAndIssues) {
            console.log("now populated!", presetLanguage.value);
            updateLanguageStatus(presetLanguage.value, "available");
          }
        }
      }, 60_000);

      return () => {
        clearInterval(interval);
      };
    }
    return () => {};
  }, [client, languages]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, JSON.stringify(language));
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      languages,
      setLanguage: setLanguageAndTriggerLoad,
      loading: initialLoading,
      browserLanguage,
    }),
    [
      language,
      languages,
      setLanguageAndTriggerLoad,
      initialLoading,
      browserLanguage,
    ]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

const useLanguage = (): LanguageContextProperties =>
  useContext(LanguageContext);

export { LanguageProvider, useLanguage };
