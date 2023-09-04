import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { useLanguage } from "../providers/language";
import { useLoading } from "../providers/loading";
import { FADE_IN_OUT } from "../utilities/constants";
import { LoadingDots } from "./components";
import Head from "./head";
import ContentPage from "./pages/content";
import LandingPage from "./pages/landing";

const Overlay = styled.div`
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

/**
 *
 */
function App() {
  const { loadingText, isLoading, setIsLoading, setLoadingText } = useLoading();
  const [willUnmount, setWillUnmount] = useState(false);
  const [mount, setMount] = useState(false);
  const cacheReference = useRef(new Set<string>());
  const { language, loading: languageLoading } = useLanguage();
  const location = useLocation();
  const [tag, id] = location.pathname.split("/").filter(Boolean) as [
    string | undefined,
    string | undefined
  ];
  const navigate = useNavigate();

  useEffect(() => {
    let timeout: number;
    if (!isLoading && mount) {
      setWillUnmount(true);
      timeout = window.setTimeout(() => {
        setMount(false);
        setWillUnmount(false);
      }, FADE_IN_OUT);
    }
    if (isLoading && !mount) setMount(true);
    return () => {
      clearTimeout(timeout);
    };
  }, [isLoading, mount]);

  useEffect(() => {
    if (languageLoading) {
      setIsLoading(true);
      setLoadingText(language.loading);
    } else {
      setIsLoading(false);
    }
  }, [languageLoading, setIsLoading, setLoadingText, language.loading]);

  // Set the URL from the language
  useEffect(() => {
    if (
      tag !== undefined &&
      tag !== "" &&
      tag !== language.value &&
      id === undefined
    )
      navigate(`/`);
  }, [id, language.value, navigate, tag]);

  return (
    <>
      <Head id={id} />
      <Overlay>
        {mount && (
          <LoadingDots
            text={loadingText}
            willUnmount={willUnmount}
            rightToLeft={language.direction}
          />
        )}
      </Overlay>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:tag" element={<LandingPage />} />
        <Route
          path="/:tag/:id"
          element={<ContentPage cacheReference={cacheReference} />}
        />
      </Routes>
    </>
  );
}

export default App;
