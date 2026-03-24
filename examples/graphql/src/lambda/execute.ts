import middy from "@middy/core";
import { appSyncGraphQLRouter } from "@middy-appsync/graphql";
import { resolvers } from "../resolvers/index.js";

export const handler = middy(appSyncGraphQLRouter({ resolvers }));
