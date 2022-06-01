export type ValueType<T extends Record<any, any>> = T[keyof T];
