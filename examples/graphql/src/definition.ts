export interface User {
  id: string;
  name: string;
}

export interface Query {
  user: User;
}

declare module "@middy-appsync/graphql" {
  interface SchemaDefinition {
    User: {
      id: { args: Record<string, never>; result: string; source: User };
      name: { args: Record<string, never>; result: string; source: User };
    };

    Query: {
      me: { source: null; args: Record<string, never>; result: User };
    };

    Mutation: {
      createUser: {
        source: null;
        args: { input: { id: string; name: string } };
        result: User;
      };
    };
  }
}
