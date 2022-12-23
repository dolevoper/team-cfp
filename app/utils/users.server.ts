import type { UserData } from "./session.server";

declare global {
    var __users: Map<string, UserData>;
}

if (!global.__users) {
    global.__users = new Map<string, UserData>();
}

export const users = global.__users;
