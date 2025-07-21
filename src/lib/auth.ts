import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "../db/db";
import { admin, openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: true,
      },
      balance: {
        type: "number",
        required: false,
      },
    },
  },
  trustedOrigins: [process.env.VERCEL_URL!],
  //...other options
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(), openAPI({ disableDefaultReference: false })],
});

export type Auth = typeof auth;
export type User = typeof auth.$Infer.Session.user | undefined;
