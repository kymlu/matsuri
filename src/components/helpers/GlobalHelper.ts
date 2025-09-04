export function strEquals(str1: string | null | undefined, str2: string | null | undefined) {
  return !isNullOrUndefined(str1) && !isNullOrUndefined(str2) && str1!.localeCompare(str2!) === 0
}

export function isNullOrUndefinedOrBlank(item: string) {
  return isNullOrUndefined(item) || item.length === 0
}

export function isNullOrUndefined(item: any) {
  return item === null || item === undefined;
}