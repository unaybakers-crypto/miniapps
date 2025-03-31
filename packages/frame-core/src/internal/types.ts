export type Compute<type> = { [key in keyof type]: type[key] } & unknown

type KeyofUnion<type> = type extends type ? keyof type : never

export type OneOf<
  union extends object,
  fallback extends object | undefined = undefined,
  ///
  keys extends KeyofUnion<union> = KeyofUnion<union>,
> = union extends infer item
  ? Compute<
      item & {
        [key in Exclude<keys, keyof item>]?: fallback extends object
          ? key extends keyof fallback
            ? fallback[key]
            : undefined
          : undefined
      }
    >
  : never

/**
 * Checks if `T` can be narrowed further than `U`
 *
 * @example
 * ```ts
 * type Result = IsNarrowable<'foo', string>
 * //   ^? true
 * ```
 */
export type IsNarrowable<T, U> = IsNever<
  (T extends U ? true : false) & (U extends T ? false : true)
> extends true
  ? false
  : true

/**
 * Checks if `T` is `never`
 *
 * @example
 * ```ts
 * type Result = IsNever<never>
 * //   ^? type Result = true
 * ```
 */
export type IsNever<T> = [T] extends [never] ? true : false
