import { gql } from "@apollo/client";

export const GET_DATA = gql`
  query getArgumentId(
    $languageId: String!
    $issueId: String!
    $affiliationId: String!
  ) {
    getArgumentId(
      languageId: $languageId
      issueId: $issueId
      affiliationId: $affiliationId
    ) {
      id
    }
  }
`;

export default GET_DATA;
