import { Definition } from "./config.js";

export type DefinitionObject = Record<string, FieldProps>;

export type DefinitionTypename = keyof Definition extends never ? string : keyof Definition;

export type ObjectFieldName<T extends DefinitionTypename> = keyof Definition extends never
  ? string
  : T extends keyof Definition
    ? keyof Definition[T]
    : never;

export type FieldArgs<
  T extends DefinitionTypename,
  F extends ObjectFieldName<T>,
> = keyof Definition extends never
  ? Record<string, unknown>
  : T extends keyof Definition
    ? keyof Definition[T] extends infer Fn
      ? Fn extends F
        ? Definition[T][Fn] extends { args: infer A }
          ? A
          : never
        : never
      : never
    : never;

export type FieldResult<
  T extends DefinitionTypename,
  F extends ObjectFieldName<T>,
> = keyof Definition extends never
  ? unknown
  : T extends keyof Definition
    ? keyof Definition[T] extends infer Fn
      ? Fn extends F
        ? Definition[T][Fn] extends { result: infer R }
          ? R
          : never
        : never
      : never
    : never;

export type FieldSource<
  T extends DefinitionTypename,
  F extends ObjectFieldName<T>,
> = keyof Definition extends never
  ? Record<string, unknown> | null
  : T extends keyof Definition
    ? keyof Definition[T] extends infer Fn
      ? Fn extends F
        ? Definition[T][Fn] extends { source: infer S }
          ? S
          : never
        : never
      : never
    : never;

export type ValueType =
  | string
  | number
  | boolean
  | null
  | { [key: string]: ValueType }
  | ValueType[];

export interface FieldProps {
  args: Record<string, ValueType>;
  result: ValueType;
  source?: ValueType;
}
