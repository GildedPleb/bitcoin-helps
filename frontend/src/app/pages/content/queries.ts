import { gql } from "@apollo/client";

export const GET_DATA = gql`
  query GetInputPairByArgumentId($getInputPairByArgumentIdId: Int!) {
    getInputPairByArgumentId(id: $getInputPairByArgumentIdId) {
      ... on Job {
        jobId
        argumentId
        language {
          name
        }
      }
      ... on InputPair {
        arguments {
          content
        }
        language {
          name
        }
      }
    }
  }
`;

export const SUBSCRIBE_TO_DATA = gql`
  subscription subscribeToArgument($jobId: String!) {
    subscribeToArgument(jobId: $jobId) {
      type
      message
      sequence
    }
  }
`;

export const DISLIKE_ONE_ARGUMENT = gql`
  mutation DislikeArgument($dislikeId: Int!) {
    dislike(id: $dislikeId)
  }
`;

export const LIKE_ONE_ARGUMENT = gql`
  mutation LikeArgument($likeId: Int!) {
    like(id: $likeId)
  }
`;
