import { defineResolvers } from "@middy-appsync/graphql";
import viewer from "./viewer.js";

export const resolvers = defineResolvers(viewer);
