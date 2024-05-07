import { Client, Models } from "node-appwrite";

export type Logger = {
    error: (msg: string | Error) => void;
    log: (msg: string) => void;
}

export type EventContext = {
    client: Client;
    event: string;
    logger: Logger
}

export type ScheduledOperation = Models.Document & {
    scheduledDate: string;
    executedAt?: string;
    resource?: string;
    operation: string;
    cancelled: boolean;
}
