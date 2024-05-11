export const EventNames = {
    onAnyUserCreated: /users\.[a-zA-Z0-9]{20}\.create/,
    onAnyUserSessionCreated: /users\.[a-zA-Z0-9]{20}\.sessions\.[a-zA-Z0-9]{20}\.create/
} as const;
