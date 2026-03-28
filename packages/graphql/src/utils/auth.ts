import type {
  AppSyncIdentity,
  AppSyncIdentityCognito,
  AppSyncIdentityIAM,
  AppSyncIdentityLambda,
  AppSyncIdentityOIDC,
} from "aws-lambda";
import type { Authorization } from "./config.js";
import { hasProperty, isDefined, isRecord, isString } from "./typeGuards.js";

export type Identity = keyof Authorization extends never
  ? AppSyncIdentity
  : keyof Authorization extends infer K
    ? K extends string
      ? K extends "allow"
        ? K extends keyof Authorization
          ? Authorization[K] extends infer U
            ? U extends AppSyncIdentity
              ? U
              : AppSyncIdentity
            : AppSyncIdentity
          : AppSyncIdentity
        : AppSyncIdentity
      : AppSyncIdentity
    : AppSyncIdentity;

export function isOIDC(identity: AppSyncIdentity): identity is AppSyncIdentityOIDC {
  return (
    isDefined(identity) &&
    hasProperty(identity, "sub") &&
    isString(identity.sub) &&
    hasProperty(identity, "issuer") &&
    isString(identity.issuer) &&
    hasProperty(identity, "claims") &&
    isRecord(identity.claims)
  );
}

export function isCognito(identity: AppSyncIdentity): identity is AppSyncIdentityCognito {
  return (
    isOIDC(identity) &&
    hasProperty(identity, "username") &&
    isString(identity.username) &&
    hasProperty(identity, "groups") &&
    hasProperty(identity, "sourceIp") &&
    Array.isArray(identity.sourceIp) &&
    identity.sourceIp.every(isString)
  );
}

export function isIAM(identity: AppSyncIdentity): identity is AppSyncIdentityIAM {
  return (
    isDefined(identity) &&
    hasProperty(identity, "accountId") &&
    isString(identity.accountId) &&
    hasProperty(identity, "cognitoIdentityPoolId") &&
    isString(identity.cognitoIdentityPoolId) &&
    hasProperty(identity, "sourceIp") &&
    Array.isArray(identity.sourceIp) &&
    identity.sourceIp.every(isString) &&
    hasProperty(identity, "username") &&
    isString(identity.username)
  );
}

export function isLambda(identity: AppSyncIdentity): identity is AppSyncIdentityLambda {
  return (
    isDefined(identity) &&
    hasProperty(identity, "resolverContext") &&
    isRecord(identity.resolverContext)
  );
}

export function rule<TIdentity extends AppSyncIdentity>(
  predicate: (identity: TIdentity) => identity is TIdentity
) {
  return predicate;
}
