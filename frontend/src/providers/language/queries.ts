import { gql } from "@apollo/client";

export const GET_AFFILIATIONS_ISSUES = gql`
  query GetAfffiliationsAndIssues($language: String!) {
    getAfffiliationsAndIssues(language: $language) {
      id
      translations {
        selectAffiliation
        selectIssue
        selectNoMatch
        speak
        iAmAffiliatedWith
        andICareAbout
        loading
        whyCare
        curatingContent
        readNow
        siteDescription
        siteTitle
      }
      affiliationTypes {
        label
        options {
          value
          label
        }
      }
      issueCategories {
        label
        options {
          value
          label
        }
      }
    }
  }
`;

export default GET_AFFILIATIONS_ISSUES;
