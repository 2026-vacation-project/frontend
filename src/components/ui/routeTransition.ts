import { createContext, useContext, useLayoutEffect } from 'react';

interface RouteTransitionContextValue {
    routeKey: string;
    skipForLoading: (routeKey: string) => void;
}

export const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

export function useSkipRouteTransitionForLoading() {
    const transition = useContext(RouteTransitionContext);

    useLayoutEffect(() => {
        if (transition) transition.skipForLoading(transition.routeKey);
    }, [transition]);
}
