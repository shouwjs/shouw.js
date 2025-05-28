export enum ParamType {
    URL = 0,
    String = 1,
    BigInt = 2,
    Void = 3,
    Number = 4,
    Object = 5,
    Array = 6,
    Boolean = 8
}

export enum Precedence {
    '&&' = 1,
    '||' = 1,
    '==' = 2,
    '!=' = 2,
    '>=' = 3,
    '<=' = 3,
    '>' = 3,
    '<' = 3
}
