// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-underscore-dangle */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useResizeObserver from "use-resize-observer";

import { useGetArgumentRouteQuery } from "../../../graphql/generated";
import { isRtl, useLanguage } from "../../../providers/language";
import { useLoading } from "../../../providers/loading";
import fadeOut from "../../../styles/fade-out";
import { FADE_IN_OUT } from "../../../utilities/constants";
import { MenuBar, SubMenuBar, SubTitle, Title } from "../../components";
import copyToClipboard from "../../utilities/copy-to-clipboard";
import Argument from "./argument";
import Job from "./job";
import { useLikes } from "./like-dislike-hook";

const Container = styled.section<{ willUnmount: boolean; minHeight: number }>`
  text-align: left;
  width: 100%;
  height: 100%;
  min-height: ${(properties) => properties.minHeight}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5vh 0;
  transition: all 0.3s;
  ${(properties) =>
    properties.willUnmount
      ? css`
          animation: ${fadeOut} ${FADE_IN_OUT / 1000}s forwards;
        `
      : ""}
  & > * {
    margin-bottom: 5vh;
  }
  & > *:last-child {
    margin-top: auto;
  }
`;

/**
 *
 * @param root0 - props
 */
function ContentPage({
  cacheReference,
}: {
  cacheReference: React.MutableRefObject<Set<string>>;
}) {
  const [willUnmount, setWillUnmount] = useState(false);
  const [showLikeUnlike, setShowLikeUnlike] = useState(false);
  const { setIsLoading } = useLoading();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    dislikeLoading,
    likeLoading,
    disliked,
    liked,
    handleDislike,
    handleLike,
  } = useLikes(id);
  const [contentHeight, setContentHeight] = useState(window.innerHeight);
  const { ref: contentReference, height = window.innerHeight } =
    useResizeObserver<HTMLDivElement>();

  const { loading, error, data, refetch } = useGetArgumentRouteQuery({
    variables: { argumentId: Number(id) },
    skip: Number.isNaN(Number(id)),
  });
  const { language } = useLanguage();

  const direction =
    data?.getArgumentRoute?.language === undefined
      ? language.direction
      : isRtl(data.getArgumentRoute.language);

  useEffect(() => {
    if (height > contentHeight)
      setContentHeight(
        height + (showLikeUnlike ? 0 : window.innerHeight * 0.1)
      );
  }, [contentHeight, height, showLikeUnlike]);

  // This caching is needed to help Apollo find arguments or streams to
  // new arguments when it has already populated its cache with null responces
  // for arguments that are not yet existant, but then become existant over time.
  useEffect(() => {
    if (loading) {
      setIsLoading(true);
      return;
    }
    if (id === undefined || error) return;
    const argumentData = data?.getArgumentRoute;
    const has = cacheReference.current.has(id);

    // If the previous fetch was a job, we should refetch the data from the server: either the job is still active,
    // or it has completed. Either way, if we dont refetch, we will not have the current state of the job.
    if (argumentData?.route.__typename === "Job") {
      setIsLoading(false);
      refetch().catch((error_) => {
        throw error_;
      });
      return;
    }

    // If no data was fetched, or if the fetched data is null and the id is not in the cache, update the cache and navigate
    if (!data || (argumentData === null && !has)) {
      cacheReference.current.add(id);
      navigate(`/${language.value}`);
      return;
    }

    // If the fetched data is null and the id is already in the cache, we attempt to refetch
    if (argumentData === null && has) {
      refetch().catch((error_) => {
        throw error_;
      });
      return;
    }

    // If we get here, we have recieved real data.
    if (argumentData?.route.__typename === "InputPair") {
      setShowLikeUnlike(true);
      setIsLoading(false);
    }
    cacheReference.current.delete(id);
  }, [
    data,
    refetch,
    navigate,
    id,
    error,
    cacheReference,
    loading,
    setIsLoading,
    language.value,
  ]);

  const handleOnClick = useCallback(() => {
    setWillUnmount(true);
    setTimeout(() => {
      navigate(`/${language.value}`);
    }, FADE_IN_OUT);
  }, [language.value, navigate]);

  const handleCopyLink = useCallback(() => {
    if (id !== undefined && id !== "") copyToClipboard(window.location.href);
  }, [id]);

  const handleCopyText = useCallback(() => {
    if (
      id !== undefined &&
      id !== "" &&
      data?.getArgumentRoute?.route.__typename === "InputPair"
    )
      copyToClipboard(data.getArgumentRoute.route.arguments[0].content);
    // TODO: If the type is a job, we would need to pipe the messages back here
  }, [data?.getArgumentRoute?.route, id]);

  if (loading) return <div />;
  if (error) {
    console.error(error);
    return <div />;
  }

  return (
    <Container
      willUnmount={willUnmount}
      ref={contentReference}
      minHeight={contentHeight}
    >
      <MenuBar
        onGoBack={handleOnClick}
        onLink={handleCopyLink}
        onCopyText={handleCopyText}
        title={data?.getArgumentRoute?.title ?? ""}
        subtitle={data?.getArgumentRoute?.subtitle ?? ""}
        direction={direction}
      />
      <Title direction={direction}>{data?.getArgumentRoute?.title}</Title>
      <SubTitle direction={direction}>
        {data?.getArgumentRoute?.subtitle}
      </SubTitle>
      {data?.getArgumentRoute?.route.__typename === "Job" && (
        <Job
          job={data.getArgumentRoute.route}
          setShowLikeUnlike={setShowLikeUnlike}
        />
      )}
      {data?.getArgumentRoute?.route.__typename === "InputPair" && (
        <Argument
          inputPair={data.getArgumentRoute.route}
          language={data.getArgumentRoute.language}
        />
      )}

      {showLikeUnlike && (
        <SubMenuBar
          onFlag={handleDislike}
          liked={liked}
          disliked={disliked}
          dislikeLoading={dislikeLoading}
          likeLoading={likeLoading}
          onCopy={handleLike}
          disabled={!showLikeUnlike}
        />
      )}
    </Container>
  );
}

export default ContentPage;
