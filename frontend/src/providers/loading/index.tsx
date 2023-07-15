import React, {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

interface LoadingContextInterface {
  loadingText: string | undefined;
  setLoadingText: React.Dispatch<React.SetStateAction<string | undefined>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoadingContext = createContext<LoadingContextInterface | undefined>(
  undefined
);

interface LoadingProviderProperties {
  children: ReactNode;
}

/**
 *
 * @param root0 - Props
 */
function LoadingProvider({ children }: LoadingProviderProperties) {
  const [loadingText, setLoadingText] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const load = useMemo(
    () => ({ loadingText, setLoadingText, isLoading, setIsLoading }),
    [loadingText, setLoadingText, isLoading, setIsLoading]
  );

  return (
    <LoadingContext.Provider value={load}>{children}</LoadingContext.Provider>
  );
}

const useLoading = (): LoadingContextInterface => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export { LoadingProvider, useLoading };
