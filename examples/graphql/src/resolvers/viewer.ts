import {
  createMutationResolver,
  createQueryResolver,
  createResolver,
  defineResolvers,
} from "@middy-appsync/graphql";

export const userName = createResolver({
  typeName: "User",
  fieldName: "name",
  resolve: ({ source }) => {
    return source.name;
  },
});

export const viewer = createQueryResolver({
  fieldName: "me",
  resolve: () => {
    return {
      id: "123",
      name: "John Doe",
    };
  },
});

export const createUser = createMutationResolver({
  fieldName: "createUser",
  resolve: ({ arguments: { input } }) => {
    return {
      id: input.id,
      name: input.name,
    };
  },
});

export default defineResolvers(userName, viewer, createUser);
