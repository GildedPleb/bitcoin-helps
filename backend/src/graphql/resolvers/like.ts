import { type Argument } from "@prisma/client";

import awsInvoke from "../../aws/invoke";

interface LikeOrDislike {
  id: number;
  like: boolean;
}

const likeArgument = async (argument: LikeOrDislike) =>
  awsInvoke<Argument | undefined>(
    process.env.LIKE_OR_DISLIKE,
    "RequestResponse",
    argument
  );

export const like = async (
  _parent: unknown,
  { id }: { id: number }
): Promise<number | undefined> => {
  const updated = await likeArgument({ id, like: true });
  return updated?.like;
};

export default like;
