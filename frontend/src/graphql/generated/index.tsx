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

export type Query = {
  __typename?: 'Query';
  getAfffiliationsAndIssues?: Maybe<LanguageSelectors>;
  getArgumentId?: Maybe<ArgumentId>;
  getInputPairByArgumentId?: Maybe<InputPairOrJob>;
  hello?: Maybe<Scalars['String']['output']>;
};


export type QueryGetAfffiliationsAndIssuesArgs = {
  language: Scalars['String']['input'];
};


export type QueryGetArgumentIdArgs = {
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  issueId?: InputMaybe<Scalars['String']['input']>;
  languageId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetInputPairByArgumentIdArgs = {
  id: Scalars['Int']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  subscribeToArgument?: Maybe<Update>;
};


export type SubscriptionSubscribeToArgumentArgs = {
  jobId: Scalars['String']['input'];
};

export type TranslationTypeMapped = {
  __typename?: 'TranslationTypeMapped';
  andICareAbout: Scalars['String']['output'];
  findingArgument: Scalars['String']['output'];
  iAmAffiliatedWith: Scalars['String']['output'];
  loading: Scalars['String']['output'];
  selectAffiliation: Scalars['String']['output'];
  selectIssue: Scalars['String']['output'];
  selectNoMatch: Scalars['String']['output'];
  speak: Scalars['String']['output'];
  whyCare: Scalars['String']['output'];
};

export type Update = {
  __typename?: 'Update';
  message: Scalars['String']['output'];
  sequence: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type GetInputPairByArgumentIdQueryVariables = Exact<{
  getInputPairByArgumentIdId: Scalars['Int']['input'];
}>;


export type GetInputPairByArgumentIdQuery = { __typename?: 'Query', getInputPairByArgumentId?: { __typename?: 'InputPair', arguments: Array<{ __typename?: 'Argument', content: string }>, language: { __typename?: 'LanguageMinimal', name: string } } | { __typename?: 'Job', jobId: string, argumentId: number, scheduledFor: string, language: { __typename?: 'LanguageMinimal', name: string } } | null };

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

export type GetArgumentIdQueryVariables = Exact<{
  languageId: Scalars['String']['input'];
  issueId: Scalars['String']['input'];
  affiliationId: Scalars['String']['input'];
}>;


export type GetArgumentIdQuery = { __typename?: 'Query', getArgumentId?: { __typename?: 'ArgumentId', id: number } | null };

export type GetAfffiliationsAndIssuesQueryVariables = Exact<{
  language: Scalars['String']['input'];
}>;


export type GetAfffiliationsAndIssuesQuery = { __typename?: 'Query', getAfffiliationsAndIssues?: { __typename?: 'LanguageSelectors', id: string, translations: { __typename?: 'TranslationTypeMapped', selectAffiliation: string, selectIssue: string, selectNoMatch: string, speak: string, iAmAffiliatedWith: string, andICareAbout: string, loading: string, whyCare: string }, affiliationTypes: Array<{ __typename?: 'GroupType', label: string, options: Array<{ __typename?: 'OptionType', value: string, label: string }> }>, issueCategories: Array<{ __typename?: 'GroupType', label: string, options: Array<{ __typename?: 'OptionType', value: string, label: string }> }> } | null };


export const GetInputPairByArgumentIdDocument = gql`
    query GetInputPairByArgumentId($getInputPairByArgumentIdId: Int!) {
  getInputPairByArgumentId(id: $getInputPairByArgumentIdId) {
    ... on Job {
      jobId
      argumentId
      scheduledFor
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

/**
 * __useGetInputPairByArgumentIdQuery__
 *
 * To run a query within a React component, call `useGetInputPairByArgumentIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInputPairByArgumentIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInputPairByArgumentIdQuery({
 *   variables: {
 *      getInputPairByArgumentIdId: // value for 'getInputPairByArgumentIdId'
 *   },
 * });
 */
export function useGetInputPairByArgumentIdQuery(baseOptions: Apollo.QueryHookOptions<GetInputPairByArgumentIdQuery, GetInputPairByArgumentIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInputPairByArgumentIdQuery, GetInputPairByArgumentIdQueryVariables>(GetInputPairByArgumentIdDocument, options);
      }
export function useGetInputPairByArgumentIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInputPairByArgumentIdQuery, GetInputPairByArgumentIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInputPairByArgumentIdQuery, GetInputPairByArgumentIdQueryVariables>(GetInputPairByArgumentIdDocument, options);
        }
export type GetInputPairByArgumentIdQueryHookResult = ReturnType<typeof useGetInputPairByArgumentIdQuery>;
export type GetInputPairByArgumentIdLazyQueryHookResult = ReturnType<typeof useGetInputPairByArgumentIdLazyQuery>;
export type GetInputPairByArgumentIdQueryResult = Apollo.QueryResult<GetInputPairByArgumentIdQuery, GetInputPairByArgumentIdQueryVariables>;
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