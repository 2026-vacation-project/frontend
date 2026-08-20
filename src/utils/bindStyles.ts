type ClassName = string | false | null | undefined;

export function bindStyles(styles: Readonly<Record<string, string>>) {
    return (...classNames: ClassName[]) =>
        classNames
            .flatMap((className) => (className ? className.split(' ') : []))
            .map((className) => styles[className] ?? className)
            .join(' ');
}
