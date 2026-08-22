import { useState } from 'react';
import { css } from '../../appStyles';

export function GameArtwork({
    name,
    src,
    size = 'md',
    fit = 'cover',
    className = '',
}: {
    name: string;
    src?: string | null;
    size?: 'sm' | 'md' | 'lg';
    fit?: 'cover' | 'contain';
    className?: string;
}) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const showImage = Boolean(src && src !== failedSrc);

    return (
        <span
            className={css('game-artwork', `game-artwork--${size}`, `game-artwork--${fit}`, className)}
            aria-hidden="true"
        >
            {showImage ? (
                <img
                    src={src ?? undefined}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    onError={() => setFailedSrc(src ?? null)}
                />
            ) : (
                <span className={css('game-artwork__fallback')}>{name.trim().slice(0, 1).toUpperCase()}</span>
            )}
        </span>
    );
}
