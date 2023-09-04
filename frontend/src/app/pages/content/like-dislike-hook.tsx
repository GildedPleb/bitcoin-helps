import { useCallback, useState } from "react";

import {
  useDislikeArgumentMutation,
  useLikeArgumentMutation,
} from "../../../graphql/generated";

export const useLikes = (id: string | undefined) => {
  const [dislikeArgument, { loading: dislikeLoading }] =
    useDislikeArgumentMutation();
  const [likeArgument, { loading: likeLoading }] = useLikeArgumentMutation();
  const [disliked, setDisliked] = useState(false);
  const [liked, setLiked] = useState(false);

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

  return {
    dislikeLoading,
    likeLoading,
    disliked,
    liked,
    handleDislike,
    handleLike,
  };
};

export default useLikes;
