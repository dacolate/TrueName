import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { Auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>(), adminClient()],
});
