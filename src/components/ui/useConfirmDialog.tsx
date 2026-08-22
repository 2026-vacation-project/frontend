import { useCallback, useEffect, useRef, useState } from 'react';
import { css } from '../../appStyles';
import { Button, Dialog } from '.';

interface ConfirmRequest {
    title: string;
    description: string;
    confirmLabel: string;
    tone: 'primary' | 'danger';
}

export function useConfirmDialog() {
    const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);
    const [request, setRequest] = useState<ConfirmRequest | null>(null);

    useEffect(
        () => () => {
            resolverRef.current?.(false);
        },
        [],
    );

    const confirm = useCallback(
        ({
            title,
            description,
            confirmLabel = '확인',
            tone = 'primary',
        }: {
            title: string;
            description: string;
            confirmLabel?: string;
            tone?: 'primary' | 'danger';
        }) =>
            new Promise<boolean>((resolve) => {
                resolverRef.current?.(false);
                resolverRef.current = resolve;
                setRequest({ title, description, confirmLabel, tone });
            }),
        [],
    );

    const close = useCallback((confirmed: boolean) => {
        resolverRef.current?.(confirmed);
        resolverRef.current = null;
        setRequest(null);
    }, []);
    const cancel = useCallback(() => close(false), [close]);

    const dialog = (
        <Dialog open={Boolean(request)} title={request?.title ?? ''} onClose={cancel}>
            <p className={css('confirm-dialog__description')}>{request?.description}</p>
            <div className={css('confirm-dialog__actions')}>
                <Button tone="quiet" data-autofocus onClick={cancel}>
                    취소
                </Button>
                <Button tone={request?.tone ?? 'primary'} onClick={() => close(true)}>
                    {request?.confirmLabel ?? '확인'}
                </Button>
            </div>
        </Dialog>
    );

    return { confirm, dialog };
}
