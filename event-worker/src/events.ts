import { EventContext } from "./types";

export const Events: [
  RegExp[],
  () => Promise<(arg: EventContext) => Promise<any>>,
][] = [
  [
    [/users\.[a-zA-Z0-9]{20}\.create/],
    () => import("./event-handlers/user-created").then((m) => m.default),
  ],
  [
    [/users\.[a-zA-Z0-9]{20}\.sessions\.[a-zA-Z0-9]{20}\.create/],
    () =>
      import("./event-handlers/user-session-created").then((m) => m.default),
  ],
  [
    [
      /databases\.6587eefbaf2d45dc4407\.collections\.659074c14a88d2072f38\.\*\.create/,
    ],
    () => import("./event-handlers/institution-created").then((m) => m.default),
  ],
];
