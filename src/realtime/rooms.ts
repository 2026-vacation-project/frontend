import { API_BASE_URL } from '../api/client';
import { clearAuthSession } from '../auth/session';

export type RoomChange = 'created' | 'updated' | 'deleted' | 'participants' | 'group_deleted' | 'resync';

export interface RoomRealtimeEvent {
    groupId: string;
    roomId: string | null;
    change: RoomChange;
}

type RoomListener = (event: RoomRealtimeEvent) => void;

const listeners = new Map<string, Set<RoomListener>>();
let socket: WebSocket | null = null;
let activeToken: string | null = null;
let reconnectTimer: number | null = null;
let heartbeatTimer: number | null = null;
let reconnectAttempt = 0;
let running = false;
let ready = false;

function socketUrl() {
    const url = new URL(API_BASE_URL || window.location.origin, window.location.origin);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = `${url.pathname.replace(/\/$/, '')}/api/v1/ws/rooms`;
    url.search = '';
    url.hash = '';
    return url.toString();
}

function subscribedGroupIds() {
    return [...listeners.entries()].filter(([, groupListeners]) => groupListeners.size > 0).map(([groupId]) => groupId);
}

function sendSubscriptions() {
    if (!ready || socket?.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'subscribe', group_ids: subscribedGroupIds() }));
}

function notifyGroup(event: RoomRealtimeEvent) {
    listeners.get(event.groupId)?.forEach((listener) => listener(event));
}

function notifyResync() {
    listeners.forEach((groupListeners, groupId) => {
        groupListeners.forEach((listener) => listener({ groupId, roomId: null, change: 'resync' }));
    });
}

function clearConnectionTimers() {
    if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
    if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
    reconnectTimer = null;
    heartbeatTimer = null;
}

function scheduleReconnect() {
    if (!running || reconnectTimer !== null || !navigator.onLine) return;
    const delay = Math.min(1_000 * 2 ** reconnectAttempt, 30_000);
    reconnectAttempt += 1;
    reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        connect();
    }, delay);
}

function connect() {
    if (!running || !activeToken || socket?.readyState === WebSocket.CONNECTING) return;

    const nextSocket = new WebSocket(socketUrl());
    socket = nextSocket;
    ready = false;

    nextSocket.addEventListener('open', () => {
        if (socket !== nextSocket || !activeToken) return;
        nextSocket.send(JSON.stringify({ type: 'authenticate', token: activeToken }));
    });

    nextSocket.addEventListener('message', (messageEvent) => {
        if (socket !== nextSocket || typeof messageEvent.data !== 'string') return;
        try {
            const message = JSON.parse(messageEvent.data) as Record<string, unknown>;
            if (message.type === 'ready') {
                ready = true;
                reconnectAttempt = 0;
                sendSubscriptions();
                notifyResync();
                if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
                heartbeatTimer = window.setInterval(() => {
                    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }));
                }, 25_000);
                return;
            }
            if (
                message.type === 'room.changed' &&
                typeof message.group_id === 'string' &&
                (typeof message.room_id === 'string' || message.room_id === null) &&
                typeof message.change === 'string'
            ) {
                notifyGroup({
                    groupId: message.group_id,
                    roomId: message.room_id,
                    change: message.change as RoomChange,
                });
            }
        } catch {
            // Ignore malformed socket messages and keep the live connection available.
        }
    });

    nextSocket.addEventListener('close', (closeEvent) => {
        if (socket !== nextSocket) return;
        socket = null;
        ready = false;
        if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
        heartbeatTimer = null;
        if (closeEvent.code === 1008 || closeEvent.code === 4001) {
            stopRoomRealtime();
            clearAuthSession();
            return;
        }
        scheduleReconnect();
    });

    nextSocket.addEventListener('error', () => nextSocket.close());
}

function reconnectWhenOnline() {
    if (!running || socket) return;
    reconnectAttempt = 0;
    connect();
}

export function startRoomRealtime(token: string) {
    stopRoomRealtime();
    activeToken = token;
    running = true;
    window.addEventListener('online', reconnectWhenOnline);
    connect();

    return () => {
        if (activeToken === token) stopRoomRealtime();
    };
}

export function stopRoomRealtime() {
    running = false;
    ready = false;
    activeToken = null;
    clearConnectionTimers();
    window.removeEventListener('online', reconnectWhenOnline);
    const previousSocket = socket;
    socket = null;
    if (previousSocket && previousSocket.readyState < WebSocket.CLOSING) previousSocket.close(1000, '로그아웃');
}

export function subscribeToRoomChanges(groupId: string, listener: RoomListener) {
    const groupListeners = listeners.get(groupId) ?? new Set<RoomListener>();
    groupListeners.add(listener);
    listeners.set(groupId, groupListeners);
    sendSubscriptions();

    return () => {
        const currentListeners = listeners.get(groupId);
        currentListeners?.delete(listener);
        if (!currentListeners?.size) listeners.delete(groupId);
        sendSubscriptions();
    };
}
