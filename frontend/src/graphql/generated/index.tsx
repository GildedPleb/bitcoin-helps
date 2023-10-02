import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Argument = {
  __typename?: 'Argument';
  content: Scalars['String']['output'];
};

export type ArgumentId = {
  __typename?: 'ArgumentId';
  id: Scalars['Int']['output'];
};

export type ArugmentRoute = {
  __typename?: 'ArugmentRoute';
  language: Scalars['String']['output'];
  route: InputPairOrJob;
  subtitle: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type GroupType = {
  __typename?: 'GroupType';
  label: Scalars['String']['output'];
  options: Array<OptionType>;
};

export type InputPair = {
  __typename?: 'InputPair';
  arguments: Array<Argument>;
  language: LanguageMinimal;
};

export type InputPairOrJob = InputPair | Job;

export type Invoice = {
  __typename?: 'Invoice';
  expiresAt: Scalars['String']['output'];
  paymentRequest: Scalars['String']['output'];
  settled: Scalars['Boolean']['output'];
};

export type Job = {
  __typename?: 'Job';
  argumentId: Scalars['Int']['output'];
  jobId: Scalars['String']['output'];
  language: LanguageMinimal;
  scheduledFor: Scalars['String']['output'];
};

export type LanguageMinimal = {
  __typename?: 'LanguageMinimal';
  name: Scalars['String']['output'];
};

export type LanguageSelectors = {
  __typename?: 'LanguageSelectors';
  affiliationTypes: Array<GroupType>;
  id: Scalars['String']['output'];
  issueCategories: Array<GroupType>;
  selectedAffId?: Maybe<Scalars['String']['output']>;
  selectedIssId?: Maybe<Scalars['String']['output']>;
  translations: TranslationTypeMapped;
};

export type Mutation = {
  __typename?: 'Mutation';
  dislike?: Maybe<Scalars['Int']['output']>;
  like?: Maybe<Scalars['Int']['output']>;
};


export type MutationDislikeArgs = {
  id: Scalars['Int']['input'];
};


export type MutationLikeArgs = {
  id: Scalars['Int']['input'];
};

export type OptionType = {
  __typename?: 'OptionType';
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type Paid = {
  __typename?: 'Paid';
  message: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  getAfffiliationsAndIssues?: Maybe<LanguageSelectors>;
  getArgumentId?: Maybe<ArgumentId>;
  getArgumentRoute?: Maybe<ArugmentRoute>;
  getSpeedUpInvoice?: Maybe<Invoice>;
  hello?: Maybe<Scalars['String']['output']>;
};


export type QueryGetAfffiliationsAndIssuesArgs = {
  affiliation?: InputMaybe<Scalars['String']['input']>;
  issue?: InputMaybe<Scalars['String']['input']>;
  language: Scalars['String']['input'];
};


export type QueryGetArgumentIdArgs = {
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  issueId?: InputMaybe<Scalars['String']['input']>;
  languageId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetArgumentRouteArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetSpeedUpInvoiceArgs = {
  jobId: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  subscribeToArgument?: Maybe<Update>;
  subscribeToInvoice?: Maybe<Paid>;
};


export type SubscriptionSubscribeToArgumentArgs = {
  jobId: Scalars['String']['input'];
};


export type SubscriptionSubscribeToInvoiceArgs = {
  jobId: Scalars['String']['input'];
};

export type TranslationTypeMapped = {
  __typename?: 'TranslationTypeMapped';
  andICareAbout: Scalars['String']['output'];
  curatingContent: Scalars['String']['output'];
  iAmAffiliatedWith: Scalars['String']['output'];
  loading: Scalars['String']['output'];
  readNow: Scalars['String']['output'];
  selectAffiliation: Scalars['String']['output'];
  selectIssue: Scalars['String']['output'];
  selectNoMatch: Scalars['String']['output'];
  siteDescription: Scalars['String']['output'];
  siteTitle: Scalars['String']['output'];
  speak: Scalars['String']['output'];
  whyCare: Scalars['String']['output'];
};

export type Update = {
  __typename?: 'Update';
  message: Scalars['String']['output'];
  sequence: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type GetArgumentRouteQueryVariables = Exact<{
  argumentId: Scalars['Int']['input'];
}>;


export type GetArgumentRouteQuery = { __typename?: 'Query', getArgumentRoute?: { __typename?: 'ArugmentRoute', subtitle: string, title: string, language: string, route: { __typename?: 'InputPair', arguments: Array<{ __typename?: 'Argument', content: string }> } | { __typename?: 'Job', jobId: string, argumentId: number, scheduledFor: string } } | null };

export type SubscribeToArgumentSubscriptionVariables = Exact<{
  jobId: Scalars['String']['input'];
}>;


export type SubscribeToArgumentSubscription = { __typename?: 'Subscription', subscribeToArgument?: { __typename?: 'Update', type: string, message: string, sequence: number } | null };

export type DislikeArgumentMutationVariables = Exact<{
  dislikeId: Scalars['Int']['input'];
}>;


export type DislikeArgumentMutation = { __typename?: 'Mutation', dislike?: number | null };

export type LikeArgumentMutationVariables = Exact<{
  likeId: Scalars['Int']['input'];
}>;


export type LikeArgumentMutation = { __typename?: 'Mutation', like?: number | null };

export type GetSpeedUpInvoiceQueryVariables = Exact<{
  jobId: Scalars['String']['input'];
}>;


export type GetSpeedUpInvoiceQuery = { __typename?: 'Query', getSpeedUpInvoice?: { __typename?: 'Invoice', expiresAt: string, paymentRequest: string, settled: boolean } | null };

export type SubscribeToInvoiceSubscriptionVariables = Exact<{
  jobId: Scalars['String']['input'];
}>;


export type SubscribeToInvoiceSubscription = { __typename?: 'Subscription', subscribeToInvoice?: { __typename?: 'Paid', message: string, type: string } | null };

export type GetArgumentIdQueryVariables = Exact<{
  languageId: Scalars['String']['input'];
  issueId: Scalars['String']['input'];
  affiliationId: Scalars['String']['input'];
}>;


export type GetArgumentIdQuery = { __typename?: 'Query', getArgumentId?: { __typename?: 'ArgumentId', id: number } | null };

export type GetAfffiliationsAndIssuesQueryVariables = Exact<{
  language: Scalars['String']['input'];
  affiliation?: InputMaybe<Scalars['String']['input']>;
  issue?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAfffiliationsAndIssuesQuery = { __typename?: 'Query', getAfffiliationsAndIssues?: { __typename?: 'LanguageSelectors', id: string, selectedAffId?: string | null, selectedIssId?: string | null, translations: { __typename?: 'TranslationTypeMapped', selectAffiliation: string, selectIssue: string, selectNoMatch: string, speak: string, iAmAffiliatedWith: string, andICareAbout: string, loading: string, whyCare: string, curatingContent: string, readNow: string, siteDescription: string, siteTitle: string }, affiliationTypes: Array<{ __typename?: 'GroupType', label: string, options: Array<{ __typename?: 'OptionType', value: string, label: string }> }>, issueCategories: Array<{ __typename?: 'GroupType', label: string, options: Array<{ __typename?: 'OptionType', value: string, label: string }> }> } | null };


export const GetArgumentRouteDocument = gql`
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

/**
 * __useGetArgumentRouteQuery__
 *
 * To run a query within a React component, call `useGetArgumentRouteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArgumentRouteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArgumentRouteQuery({
 *   variables: {
 *      argumentId: // value for 'argumentId'
 *   },
 * });
 */
export function useGetArgumentRouteQuery(baseOptions: Apollo.QueryHookOptions<GetArgumentRouteQuery, GetArgumentRouteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArgumentRouteQuery, GetArgumentRouteQueryVariables>(GetArgumentRouteDocument, options);
      }
export function useGetArgumentRouteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArgumentRouteQuery, GetArgumentRouteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArgumentRouteQuery, GetArgumentRouteQueryVariables>(GetArgumentRouteDocument, options);
        }
export type GetArgumentRouteQueryHookResult = ReturnType<typeof useGetArgumentRouteQuery>;
export type GetArgumentRouteLazyQueryHookResult = ReturnType<typeof useGetArgumentRouteLazyQuery>;
export type GetArgumentRouteQueryResult = Apollo.QueryResult<GetArgumentRouteQuery, GetArgumentRouteQueryVariables>;
export const SubscribeToArgumentDocument = gql`
    subscription subscribeToArgument($jobId: String!) {
  subscribeToArgument(jobId: $jobId) {
    type
    message
    sequence
  }
}
    `;

/**
 * __useSubscribeToArgumentSubscription__
 *
 * To run a query within a React component, call `useSubscribeToArgumentSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeToArgumentSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeToArgumentSubscription({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useSubscribeToArgumentSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeToArgumentSubscription, SubscribeToArgumentSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeToArgumentSubscription, SubscribeToArgumentSubscriptionVariables>(SubscribeToArgumentDocument, options);
      }
export type SubscribeToArgumentSubscriptionHookResult = ReturnType<typeof useSubscribeToArgumentSubscription>;
export type SubscribeToArgumentSubscriptionResult = Apollo.SubscriptionResult<SubscribeToArgumentSubscription>;
export const DislikeArgumentDocument = gql`
    mutation DislikeArgument($dislikeId: Int!) {
  dislike(id: $dislikeId)
}
    `;
export type DislikeArgumentMutationFn = Apollo.MutationFunction<DislikeArgumentMutation, DislikeArgumentMutationVariables>;

/**
 * __useDislikeArgumentMutation__
 *
 * To run a mutation, you first call `useDislikeArgumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDislikeArgumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [dislikeArgumentMutation, { data, loading, error }] = useDislikeArgumentMutation({
 *   variables: {
 *      dislikeId: // value for 'dislikeId'
 *   },
 * });
 */
export function useDislikeArgumentMutation(baseOptions?: Apollo.MutationHookOptions<DislikeArgumentMutation, DislikeArgumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DislikeArgumentMutation, DislikeArgumentMutationVariables>(DislikeArgumentDocument, options);
      }
export type DislikeArgumentMutationHookResult = ReturnType<typeof useDislikeArgumentMutation>;
export type DislikeArgumentMutationResult = Apollo.MutationResult<DislikeArgumentMutation>;
export type DislikeArgumentMutationOptions = Apollo.BaseMutationOptions<DislikeArgumentMutation, DislikeArgumentMutationVariables>;
export const LikeArgumentDocument = gql`
    mutation LikeArgument($likeId: Int!) {
  like(id: $likeId)
}
    `;
export type LikeArgumentMutationFn = Apollo.MutationFunction<LikeArgumentMutation, LikeArgumentMutationVariables>;

/**
 * __useLikeArgumentMutation__
 *
 * To run a mutation, you first call `useLikeArgumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLikeArgumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [likeArgumentMutation, { data, loading, error }] = useLikeArgumentMutation({
 *   variables: {
 *      likeId: // value for 'likeId'
 *   },
 * });
 */
export function useLikeArgumentMutation(baseOptions?: Apollo.MutationHookOptions<LikeArgumentMutation, LikeArgumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LikeArgumentMutation, LikeArgumentMutationVariables>(LikeArgumentDocument, options);
      }
export type LikeArgumentMutationHookResult = ReturnType<typeof useLikeArgumentMutation>;
export type LikeArgumentMutationResult = Apollo.MutationResult<LikeArgumentMutation>;
export type LikeArgumentMutationOptions = Apollo.BaseMutationOptions<LikeArgumentMutation, LikeArgumentMutationVariables>;
export const GetSpeedUpInvoiceDocument = gql`
    query GetSpeedUpInvoice($jobId: String!) {
  getSpeedUpInvoice(jobId: $jobId) {
    expiresAt
    paymentRequest
    settled
  }
}
    `;

/**
 * __useGetSpeedUpInvoiceQuery__
 *
 * To run a query within a React component, call `useGetSpeedUpInvoiceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSpeedUpInvoiceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSpeedUpInvoiceQuery({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useGetSpeedUpInvoiceQuery(baseOptions: Apollo.QueryHookOptions<GetSpeedUpInvoiceQuery, GetSpeedUpInvoiceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSpeedUpInvoiceQuery, GetSpeedUpInvoiceQueryVariables>(GetSpeedUpInvoiceDocument, options);
      }
export function useGetSpeedUpInvoiceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSpeedUpInvoiceQuery, GetSpeedUpInvoiceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSpeedUpInvoiceQuery, GetSpeedUpInvoiceQueryVariables>(GetSpeedUpInvoiceDocument, options);
        }
export type GetSpeedUpInvoiceQueryHookResult = ReturnType<typeof useGetSpeedUpInvoiceQuery>;
export type GetSpeedUpInvoiceLazyQueryHookResult = ReturnType<typeof useGetSpeedUpInvoiceLazyQuery>;
export type GetSpeedUpInvoiceQueryResult = Apollo.QueryResult<GetSpeedUpInvoiceQuery, GetSpeedUpInvoiceQueryVariables>;
export const SubscribeToInvoiceDocument = gql`
    subscription SubscribeToInvoice($jobId: String!) {
  subscribeToInvoice(jobId: $jobId) {
    message
    type
  }
}
    `;

/**
 * __useSubscribeToInvoiceSubscription__
 *
 * To run a query within a React component, call `useSubscribeToInvoiceSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeToInvoiceSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeToInvoiceSubscription({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useSubscribeToInvoiceSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeToInvoiceSubscription, SubscribeToInvoiceSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeToInvoiceSubscription, SubscribeToInvoiceSubscriptionVariables>(SubscribeToInvoiceDocument, options);
      }
export type SubscribeToInvoiceSubscriptionHookResult = ReturnType<typeof useSubscribeToInvoiceSubscription>;
export type SubscribeToInvoiceSubscriptionResult = Apollo.SubscriptionResult<SubscribeToInvoiceSubscription>;
export const GetArgumentIdDocument = gql`
    query getArgumentId($languageId: String!, $issueId: String!, $affiliationId: String!) {
  getArgumentId(
    languageId: $languageId
    issueId: $issueId
    affiliationId: $affiliationId
  ) {
    id
  }
}
    `;

/**
 * __useGetArgumentIdQuery__
 *
 * To run a query within a React component, call `useGetArgumentIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArgumentIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArgumentIdQuery({
 *   variables: {
 *      languageId: // value for 'languageId'
 *      issueId: // value for 'issueId'
 *      affiliationId: // value for 'affiliationId'
 *   },
 * });
 */
export function useGetArgumentIdQuery(baseOptions: Apollo.QueryHookOptions<GetArgumentIdQuery, GetArgumentIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArgumentIdQuery, GetArgumentIdQueryVariables>(GetArgumentIdDocument, options);
      }
export function useGetArgumentIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArgumentIdQuery, GetArgumentIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArgumentIdQuery, GetArgumentIdQueryVariables>(GetArgumentIdDocument, options);
        }
export type GetArgumentIdQueryHookResult = ReturnType<typeof useGetArgumentIdQuery>;
export type GetArgumentIdLazyQueryHookResult = ReturnType<typeof useGetArgumentIdLazyQuery>;
export type GetArgumentIdQueryResult = Apollo.QueryResult<GetArgumentIdQuery, GetArgumentIdQueryVariables>;
export const GetAfffiliationsAndIssuesDocument = gql`
    query GetAfffiliationsAndIssues($language: String!, $affiliation: String, $issue: String) {
  getAfffiliationsAndIssues(
    language: $language
    affiliation: $affiliation
    issue: $issue
  ) {
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
    selectedAffId
    selectedIssId
  }
}
    `;

/**
 * __useGetAfffiliationsAndIssuesQuery__
 *
 * To run a query within a React component, call `useGetAfffiliationsAndIssuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAfffiliationsAndIssuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAfffiliationsAndIssuesQuery({
 *   variables: {
 *      language: // value for 'language'
 *      affiliation: // value for 'affiliation'
 *      issue: // value for 'issue'
 *   },
 * });
 */
export function useGetAfffiliationsAndIssuesQuery(baseOptions: Apollo.QueryHookOptions<GetAfffiliationsAndIssuesQuery, GetAfffiliationsAndIssuesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAfffiliationsAndIssuesQuery, GetAfffiliationsAndIssuesQueryVariables>(GetAfffiliationsAndIssuesDocument, options);
      }
export function useGetAfffiliationsAndIssuesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAfffiliationsAndIssuesQuery, GetAfffiliationsAndIssuesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAfffiliationsAndIssuesQuery, GetAfffiliationsAndIssuesQueryVariables>(GetAfffiliationsAndIssuesDocument, options);
        }
export type GetAfffiliationsAndIssuesQueryHookResult = ReturnType<typeof useGetAfffiliationsAndIssuesQuery>;
export type GetAfffiliationsAndIssuesLazyQueryHookResult = ReturnType<typeof useGetAfffiliationsAndIssuesLazyQuery>;
export type GetAfffiliationsAndIssuesQueryResult = Apollo.QueryResult<GetAfffiliationsAndIssuesQuery, GetAfffiliationsAndIssuesQueryVariables>;