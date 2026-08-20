const storageKey = 'teammoa-game-covers';

function readCovers(): Record<string, string> {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
        return Object.fromEntries(
            Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
        );
    } catch {
        return {};
    }
}

export function cacheGameCover(gameName: string, coverUrl: string | null) {
    if (!coverUrl) return;
    try {
        const covers = readCovers();
        covers[gameName.trim().toLowerCase()] = coverUrl;
        localStorage.setItem(storageKey, JSON.stringify(covers));
    } catch {
        // 저장 공간을 쓸 수 없는 환경에서도 게임 선택 자체는 계속 진행합니다.
    }
}

export function getCachedGameCover(gameName: string) {
    return readCovers()[gameName.trim().toLowerCase()] ?? null;
}
