// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-underscore-dangle */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useDislikeArgumentMutation,
  useGetInputPairByArgumentIdQuery,
  useLikeArgumentMutation,
  useSubscribeToArgumentSubscription,
} from "../../../graphql/generated";
import { isRtl, useLanguage } from "../../../providers/language";
import { useLoading } from "../../../providers/loading";
import fadeOut from "../../../styles/fade-out";
import { FADE_IN_OUT } from "../../../utilities/constants";
import { MenuBar, SubMenuBar, SubTitle, Title } from "../../components";
import copyToClipboard from "../../utilities/copy-to-clipboard";
import createGenerateUniqueKey from "../../utilities/key-generator";

const generateUniqueKey = createGenerateUniqueKey();

const Container = styled.section<{ willUnmount: boolean }>`
  text-align: left;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: flex-start;
  padding-bottom: 10vh;
  transition: all 0.3s;
  ${(properties) =>
    properties.willUnmount
      ? css`
          animation: ${fadeOut} ${FADE_IN_OUT / 1000}s forwards;
        `
      : ""}
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
  const { setIsLoading, setLoadingText } = useLoading();
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<
    Array<{ message: string; sequence: number }>
  >([]);

  const {
    loading: loadingArgument,
    error,
    data,
    refetch,
  } = useGetInputPairByArgumentIdQuery({
    variables: {
      getInputPairByArgumentIdId: Number(id),
    },
    skip: Number.isNaN(Number(id)),
  });

  const { language } = useLanguage();

  const direction =
    data?.getInputPairByArgumentId?.language === undefined
      ? language.direction
      : isRtl(data.getInputPairByArgumentId.language.name);

  const [dislikeArgument, { loading: dislikeLoading }] =
    useDislikeArgumentMutation();
  const [likeArgument, { loading: likeLoading }] = useLikeArgumentMutation();
  const [disliked, setDisliked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [startSubscription, setStartSubscription] = useState(false);

  const { jobId, scheduledFor } =
    data?.getInputPairByArgumentId?.__typename === "Job"
      ? data.getInputPairByArgumentId
      : { jobId: undefined, scheduledFor: undefined };

  useEffect(() => {
    // eslint-disable-next-line no-undef
    let timerId: NodeJS.Timeout | undefined;

    if (jobId !== undefined) {
      const timeUntilScheduledFor =
        new Date(Number(scheduledFor)).getTime() - Date.now();

      if (timeUntilScheduledFor > 0) {
        setIsLoading(false);
        timerId = setTimeout(() => {
          setStartSubscription(true);
          setIsLoading(true);
        }, timeUntilScheduledFor);
      } else setStartSubscription(true);
    }

    return () => {
      if (timerId !== undefined) clearTimeout(timerId);
    };
  }, [jobId, scheduledFor, setIsLoading]);

  const { data: subscriptionData } = useSubscribeToArgumentSubscription({
    variables: { jobId: jobId ?? "empty" },
    skip: !startSubscription, // subscribe when startSubscription is true
  });

  // This caching is needed to help Apollo find arguments or streams to
  // new arguments when it has already populated its cache with null responces
  // for arguments that are not yet existant, but then become existant over time.
  useEffect(() => {
    if (loadingArgument) {
      setIsLoading(true);
      setLoadingText(language.findingArgument);
      return;
    }
    if (id === undefined || error) return;

    const argumentData = data?.getInputPairByArgumentId;
    const has = cacheReference.current.has(id);

    // If no data was fetched, or if the fetched data is null and the id is not in the cache, update the cache and navigate
    if (!data || (argumentData === null && !has)) {
      cacheReference.current.add(id);
      navigate("/");
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
    if (argumentData?.__typename === "InputPair") setIsLoading(false);
    cacheReference.current.delete(id);
  }, [
    data,
    refetch,
    navigate,
    id,
    error,
    cacheReference,
    loadingArgument,
    setIsLoading,
    setLoadingText,
    language.findingArgument,
  ]);

  useEffect(() => {
    if (
      subscriptionData?.subscribeToArgument?.message !== undefined &&
      subscriptionData.subscribeToArgument.message !== ""
    ) {
      const { message, sequence } = subscriptionData.subscribeToArgument;
      setIsLoading(false);
      setMessages((previous) => [...previous, { message, sequence }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    refetch,
    subscriptionData?.subscribeToArgument?.type,
    subscriptionData?.subscribeToArgument?.message,
    subscriptionData?.subscribeToArgument,
  ]);

  const handleOnClick = useCallback(() => {
    setWillUnmount(true);
    setTimeout(() => {
      navigate("/");
    }, FADE_IN_OUT);
  }, [navigate]);

  const handleDislike = useCallback(() => {
    if (id !== undefined && id !== "")
      dislikeArgument({ variables: { dislikeId: Number(id) } })
        .then(() => {
          setDisliked(true);
          setLiked(false);
          return true;
        })
        .catch((error_) => {
          console.error(error_);
        });
  }, [dislikeArgument, id]);

  const handleLike = useCallback(() => {
    if (id !== undefined && id !== "") {
      likeArgument({ variables: { likeId: Number(id) } })
        .then(() => {
          setLiked(true);
          setDisliked(false);
          return true;
        })
        .catch((error_) => {
          console.error(error_);
        });
    }
  }, [id, likeArgument]);

  const handleCopyLink = useCallback(() => {
    if (id !== undefined && id !== "") copyToClipboard(window.location.href);
  }, [id]);

  if (loadingArgument) return <div />;
  if (error) return <p>Error :( {JSON.stringify(error)}</p>;

  return (
    <Container willUnmount={willUnmount}>
      <MenuBar
        onGoBack={handleOnClick}
      <Title direction={direction}>{data?.getArgumentRoute?.title}</Title>
      <SubTitle direction={direction}>
        {data?.getArgumentRoute?.subtitle}
      </SubTitle>
    </Container>
  );
}

export default ContentPage;
