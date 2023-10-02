import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<RefType extends Record<string, unknown>> = {
  InputPairOrJob: ( InputPair ) | ( Job );
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Argument: ResolverTypeWrapper<Argument>;
  ArgumentId: ResolverTypeWrapper<ArgumentId>;
  ArugmentRoute: ResolverTypeWrapper<Omit<ArugmentRoute, 'route'> & { route: ResolversTypes['InputPairOrJob'] }>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  GroupType: ResolverTypeWrapper<GroupType>;
  InputPair: ResolverTypeWrapper<InputPair>;
  InputPairOrJob: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['InputPairOrJob']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Invoice: ResolverTypeWrapper<Invoice>;
  Job: ResolverTypeWrapper<Job>;
  LanguageMinimal: ResolverTypeWrapper<LanguageMinimal>;
  LanguageSelectors: ResolverTypeWrapper<LanguageSelectors>;
  Mutation: ResolverTypeWrapper<{}>;
  OptionType: ResolverTypeWrapper<OptionType>;
  Paid: ResolverTypeWrapper<Paid>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  TranslationTypeMapped: ResolverTypeWrapper<TranslationTypeMapped>;
  Update: ResolverTypeWrapper<Update>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Argument: Argument;
  ArgumentId: ArgumentId;
  ArugmentRoute: Omit<ArugmentRoute, 'route'> & { route: ResolversParentTypes['InputPairOrJob'] };
  Boolean: Scalars['Boolean']['output'];
  GroupType: GroupType;
  InputPair: InputPair;
  InputPairOrJob: ResolversUnionTypes<ResolversParentTypes>['InputPairOrJob'];
  Int: Scalars['Int']['output'];
  Invoice: Invoice;
  Job: Job;
  LanguageMinimal: LanguageMinimal;
  LanguageSelectors: LanguageSelectors;
  Mutation: {};
  OptionType: OptionType;
  Paid: Paid;
  Query: {};
  String: Scalars['String']['output'];
  Subscription: {};
  TranslationTypeMapped: TranslationTypeMapped;
  Update: Update;
};

export type ArgumentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Argument'] = ResolversParentTypes['Argument']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArgumentIdResolvers<ContextType = any, ParentType extends ResolversParentTypes['ArgumentId'] = ResolversParentTypes['ArgumentId']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArugmentRouteResolvers<ContextType = any, ParentType extends ResolversParentTypes['ArugmentRoute'] = ResolversParentTypes['ArugmentRoute']> = {
  language?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  route?: Resolver<ResolversTypes['InputPairOrJob'], ParentType, ContextType>;
  subtitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GroupTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['GroupType'] = ResolversParentTypes['GroupType']> = {
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  options?: Resolver<Array<ResolversTypes['OptionType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InputPairResolvers<ContextType = any, ParentType extends ResolversParentTypes['InputPair'] = ResolversParentTypes['InputPair']> = {
  arguments?: Resolver<Array<ResolversTypes['Argument']>, ParentType, ContextType>;
  language?: Resolver<ResolversTypes['LanguageMinimal'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InputPairOrJobResolvers<ContextType = any, ParentType extends ResolversParentTypes['InputPairOrJob'] = ResolversParentTypes['InputPairOrJob']> = {
  __resolveType: TypeResolveFn<'InputPair' | 'Job', ParentType, ContextType>;
};

export type InvoiceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Invoice'] = ResolversParentTypes['Invoice']> = {
  expiresAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  paymentRequest?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  settled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JobResolvers<ContextType = any, ParentType extends ResolversParentTypes['Job'] = ResolversParentTypes['Job']> = {
  argumentId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  jobId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  language?: Resolver<ResolversTypes['LanguageMinimal'], ParentType, ContextType>;
  scheduledFor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LanguageMinimalResolvers<ContextType = any, ParentType extends ResolversParentTypes['LanguageMinimal'] = ResolversParentTypes['LanguageMinimal']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LanguageSelectorsResolvers<ContextType = any, ParentType extends ResolversParentTypes['LanguageSelectors'] = ResolversParentTypes['LanguageSelectors']> = {
  affiliationTypes?: Resolver<Array<ResolversTypes['GroupType']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  issueCategories?: Resolver<Array<ResolversTypes['GroupType']>, ParentType, ContextType>;
  selectedAffId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  selectedIssId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  translations?: Resolver<ResolversTypes['TranslationTypeMapped'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  dislike?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDislikeArgs, 'id'>>;
  like?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationLikeArgs, 'id'>>;
};

export type OptionTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['OptionType'] = ResolversParentTypes['OptionType']> = {
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaidResolvers<ContextType = any, ParentType extends ResolversParentTypes['Paid'] = ResolversParentTypes['Paid']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getAfffiliationsAndIssues?: Resolver<Maybe<ResolversTypes['LanguageSelectors']>, ParentType, ContextType, RequireFields<QueryGetAfffiliationsAndIssuesArgs, 'language'>>;
  getArgumentId?: Resolver<Maybe<ResolversTypes['ArgumentId']>, ParentType, ContextType, Partial<QueryGetArgumentIdArgs>>;
  getArgumentRoute?: Resolver<Maybe<ResolversTypes['ArugmentRoute']>, ParentType, ContextType, RequireFields<QueryGetArgumentRouteArgs, 'id'>>;
  getSpeedUpInvoice?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType, RequireFields<QueryGetSpeedUpInvoiceArgs, 'jobId'>>;
  hello?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  subscribeToArgument?: SubscriptionResolver<Maybe<ResolversTypes['Update']>, "subscribeToArgument", ParentType, ContextType, RequireFields<SubscriptionSubscribeToArgumentArgs, 'jobId'>>;
  subscribeToInvoice?: SubscriptionResolver<Maybe<ResolversTypes['Paid']>, "subscribeToInvoice", ParentType, ContextType, RequireFields<SubscriptionSubscribeToInvoiceArgs, 'jobId'>>;
};

export type TranslationTypeMappedResolvers<ContextType = any, ParentType extends ResolversParentTypes['TranslationTypeMapped'] = ResolversParentTypes['TranslationTypeMapped']> = {
  andICareAbout?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  curatingContent?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  iAmAffiliatedWith?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  loading?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readNow?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  selectAffiliation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  selectIssue?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  selectNoMatch?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  siteDescription?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  siteTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  speak?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  whyCare?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateResolvers<ContextType = any, ParentType extends ResolversParentTypes['Update'] = ResolversParentTypes['Update']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sequence?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Argument?: ArgumentResolvers<ContextType>;
  ArgumentId?: ArgumentIdResolvers<ContextType>;
  ArugmentRoute?: ArugmentRouteResolvers<ContextType>;
  GroupType?: GroupTypeResolvers<ContextType>;
  InputPair?: InputPairResolvers<ContextType>;
  InputPairOrJob?: InputPairOrJobResolvers<ContextType>;
  Invoice?: InvoiceResolvers<ContextType>;
  Job?: JobResolvers<ContextType>;
  LanguageMinimal?: LanguageMinimalResolvers<ContextType>;
  LanguageSelectors?: LanguageSelectorsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OptionType?: OptionTypeResolvers<ContextType>;
  Paid?: PaidResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TranslationTypeMapped?: TranslationTypeMappedResolvers<ContextType>;
  Update?: UpdateResolvers<ContextType>;
};

