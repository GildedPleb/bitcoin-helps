import styled from "@emotion/styled";
import React, { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { useLanguage } from "../providers/language";
import { useLoading } from "../providers/loading";
import { FADE_IN_OUT } from "../utilities/constants";
import { LoadingDots } from "./components";
import ContentPage from "./pages/content";
import LandingPage from "./pages/landing";

// Overlay Styles
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
  const { loadingText, isLoading } = useLoading();
  const [willUnmount, setWillUnmount] = useState(false);
  const [mount, setMount] = useState(false);
  const cacheReference = useRef(new Set<string>());
  const { language } = useLanguage();
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
  return (
    <>
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
        <Route
          path="/:id"
          element={<ContentPage cacheReference={cacheReference} />}
        />
      </Routes>
    </>
  );
}

export default App;
