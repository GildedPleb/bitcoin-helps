import { gql } from "@apollo/client";

export const GET_ROUTE = gql`
  query GetArgumentRoute($argumentId: Int!) {
    getArgumentRoute(id: $argumentId) {
      subtitle
      title
      language
      route {
        ... on Job {
          jobId
          argumentId
          scheduledFor
        }
        ... on InputPair {
          arguments {
            content
          }
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

export const GET_SPEEDUP_INVOICE = gql`
  query GetSpeedUpInvoice($jobId: String!) {
    getSpeedUpInvoice(jobId: $jobId) {
      expiresAt
      paymentRequest
      settled
    }
  }
`;

export const SUBSCRIBE_TO_INVOICE = gql`
  subscription SubscribeToInvoice($jobId: String!) {
    subscribeToInvoice(jobId: $jobId) {
      message
      type
    }
  }
`;
