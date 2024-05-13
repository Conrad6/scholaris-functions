import { Client, Models } from "node-appwrite";
import { URL } from "url";

export type UserPreferences = Models.Preferences & {
    theme: 'light' | 'dark',
    country: string,
    avatar?: string;
    locale: string;
    logo?: string;
    publicEmail: boolean;
    publicPhone: boolean;
}

export type RequestContext<T = unknown> = {
    user?: Models.User<UserPreferences>,
    requestURL: URL;
    client: Client;
    headers: Record<string, string>;
    logger: { log: (arg: string) => void, error: (arg: string) => void };
    request: any;
    body?: Record<string, T>
    response?: any;
}

export class NotFoundException extends Error {
    constructor(arg: string) {
        super(`404 - Resource not found: ${arg}`);
    }
}

export class ForbiddenException extends Error {
    constructor() {
        super('Forbidden operation');
    }
}

export class UnauthorizedException extends Error {
    constructor() {
        super('Unauthorized operation');
    }
}

export class BadRequestException extends Error {
    constructor(msg: string) {
        super(msg)
    }
}

export type ScheduledOperation = Models.Document & {
    scheduledDate: string;
    executedAt?: string;
    resource: string;
    operation: string;
    cancelled: boolean;
}
