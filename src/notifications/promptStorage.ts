const webPushPromptDismissalKey = 'teammoa-web-push-prompt-dismissed-v2';

export function hasDismissedWebPushPrompt() {
    return sessionStorage.getItem(webPushPromptDismissalKey) === 'true';
}

export function dismissWebPushPrompt() {
    sessionStorage.setItem(webPushPromptDismissalKey, 'true');
}

export function clearWebPushPromptDismissal() {
    sessionStorage.removeItem(webPushPromptDismissalKey);
}
