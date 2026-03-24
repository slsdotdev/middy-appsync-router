import middy, { MiddlewareObj, MiddyfiedHandler } from "@middy/core";
import { AppSyncResolverEvent, Context } from "aws-lambda";
import {
  DefinitionTypename,
  FieldArgs,
  FieldResult,
  FieldSource,
  ObjectFieldName,
} from "../utils/definition.js";

export type ResolveHandler<TSource, TArgs, TResult> = (
  event: AppSyncResolverEvent<TArgs, TSource>,
  context: Context
) => Promise<TResult> | TResult;

export type BatchResolveHandler<TSource, TArgs, TResult> = (
  events: AppSyncResolverEvent<TArgs, TSource>[],
  context: Context
) => Promise<TResult[]> | TResult[];

export type ResolverEvent<
  TSource,
  TArgs,
  TBatch extends boolean | undefined = undefined,
> = TBatch extends true
  ? AppSyncResolverEvent<TArgs, TSource>[]
  : AppSyncResolverEvent<TArgs, TSource>;

export interface Resolver<
  TTypeName extends DefinitionTypename = DefinitionTypename,
  TFieldName extends ObjectFieldName<TTypeName> = ObjectFieldName<TTypeName>,
  TBatch extends boolean | undefined = undefined,
  TSource extends FieldSource<TTypeName, TFieldName> = FieldSource<TTypeName, TFieldName>,
  TArgs extends FieldArgs<TTypeName, TFieldName> = FieldArgs<TTypeName, TFieldName>,
  TResult extends FieldResult<TTypeName, TFieldName> = FieldResult<TTypeName, TFieldName>,
> {
  typeName: TTypeName;
  fieldName: TFieldName;
  batch?: TBatch;
  handler: MiddyfiedHandler<ResolverEvent<TSource, TArgs, TBatch>, TResult, Error, Context>;
  use(
    middleware: MiddlewareObj<ResolverEvent<TSource, TArgs, TBatch>, TResult, Error, Context>
  ): Resolver<TTypeName, TFieldName, TBatch, TSource, TArgs, TResult>;
}

export type AnyResolver =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Resolver<any, any, undefined, any, any, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Resolver<any, any, true, any, any, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyBatchResolver = Resolver<any, any, true, any, any, any>;

export function isBatchResolver(resolver: AnyResolver): resolver is AnyBatchResolver {
  return "batch" in resolver && resolver.batch === true;
}

export interface ResolverParams<
  TTypeName extends DefinitionTypename,
  TFieldName extends ObjectFieldName<TTypeName>,
  TBatch extends boolean | undefined,
  TSource extends FieldSource<TTypeName, TFieldName>,
  TArgs extends FieldArgs<TTypeName, TFieldName>,
  TResult extends FieldResult<TTypeName, TFieldName>,
> {
  typeName: TTypeName;
  fieldName: TFieldName;
  authorize?: unknown;
  batch?: TBatch;
  resolve: TBatch extends true
    ? BatchResolveHandler<TSource, TArgs, TResult>
    : ResolveHandler<TSource, TArgs, TResult>;
}

/**
 * Creates a GraphQL resolver for AWS AppSync.
 *
 * @example
 * ```ts
 * import { createResolver } from "@middy-appsync/graphql";
 *
 * const getUser = createResolver({
 *   typeName: "Query",
 *   fieldName: "getUser",
 *   resolve: async (event) => {
 *     const { id } = event.arguments;
 *     // Fetch user by id and return
 *   },
 * });
 * ```
 *
 * @param params - Reolver params
 * @returns
 */

export function createResolver<
  TTypeName extends DefinitionTypename = DefinitionTypename,
  TFieldName extends ObjectFieldName<TTypeName> = ObjectFieldName<TTypeName>,
  TBatch extends boolean | undefined = undefined,
  TSource extends FieldSource<TTypeName, TFieldName> = FieldSource<TTypeName, TFieldName>,
  TArgs extends FieldArgs<TTypeName, TFieldName> = FieldArgs<TTypeName, TFieldName>,
  TResult extends FieldResult<TTypeName, TFieldName> = FieldResult<TTypeName, TFieldName>,
>(
  params: ResolverParams<TTypeName, TFieldName, TBatch, TSource, TArgs, TResult>
): Resolver<TTypeName, TFieldName, TBatch, TSource, TArgs, TResult> {
  const handler = middy<ResolverEvent<TSource, TArgs, TBatch>, TResult, Error, Context>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params.resolve as any
  );

  // TODO: Implement authorization middleware based on `params.authorize`

  const resolver: Resolver<TTypeName, TFieldName, TBatch, TSource, TArgs, TResult> = {
    typeName: params.typeName,
    fieldName: params.fieldName,
    handler,
    batch: params.batch,
    use(middleware: MiddlewareObj<ResolverEvent<TSource, TArgs, TBatch>, TResult, Error, Context>) {
      handler.use(middleware);
      return resolver;
    },
  };

  return resolver;
}

export function createQueryResolver<
  TFieldName extends ObjectFieldName<"Query"> = ObjectFieldName<"Query">,
  TBatch extends boolean | undefined = undefined,
  TSource extends FieldSource<"Query", TFieldName> = FieldSource<"Query", TFieldName>,
  TArgs extends FieldArgs<"Query", TFieldName> = FieldArgs<"Query", TFieldName>,
  TResult extends FieldResult<"Query", TFieldName> = FieldResult<"Query", TFieldName>,
>(
  params: Omit<ResolverParams<"Query", TFieldName, TBatch, TSource, TArgs, TResult>, "typeName">
): Resolver<"Query", TFieldName, TBatch, TSource, TArgs, TResult> {
  return createResolver<"Query", TFieldName, TBatch, TSource, TArgs, TResult>({
    ...params,
    typeName: "Query",
  });
}

export function createMutationResolver<
  TFieldName extends ObjectFieldName<"Mutation"> = ObjectFieldName<"Mutation">,
  TBatch extends boolean | undefined = undefined,
  TSource extends FieldSource<"Mutation", TFieldName> = FieldSource<"Mutation", TFieldName>,
  TArgs extends FieldArgs<"Mutation", TFieldName> = FieldArgs<"Mutation", TFieldName>,
  TResult extends FieldResult<"Mutation", TFieldName> = FieldResult<"Mutation", TFieldName>,
>(
  params: Omit<ResolverParams<"Mutation", TFieldName, TBatch, TSource, TArgs, TResult>, "typeName">
): Resolver<"Mutation", TFieldName, TBatch, TSource, TArgs, TResult> {
  return createResolver<"Mutation", TFieldName, TBatch, TSource, TArgs, TResult>({
    ...params,
    typeName: "Mutation",
  });
}

export function createSubscriptionResolver<
  TFieldName extends ObjectFieldName<"Subscription"> = ObjectFieldName<"Subscription">,
  TBatch extends boolean | undefined = undefined,
  TSource extends FieldSource<"Subscription", TFieldName> = FieldSource<"Subscription", TFieldName>,
  TArgs extends FieldArgs<"Subscription", TFieldName> = FieldArgs<"Subscription", TFieldName>,
  TResult extends FieldResult<"Subscription", TFieldName> = FieldResult<"Subscription", TFieldName>,
>(
  params: Omit<
    ResolverParams<"Subscription", TFieldName, TBatch, TSource, TArgs, TResult>,
    "typeName"
  >
): Resolver<"Subscription", TFieldName, TBatch, TSource, TArgs, TResult> {
  return createResolver({
    ...params,
    typeName: "Subscription",
  });
}
