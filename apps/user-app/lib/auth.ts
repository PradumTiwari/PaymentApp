import db from "@repo/database";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone Number", type: "text", placeholder: "12321232323" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { phone, password } = credentials;

        // Find existing user
        const existingUser = await db.user.findFirst({
          where: { number: phone },
        });

        if (existingUser) {
          // Validate password
          const isValidPassword = await bcrypt.compare(password, existingUser.password);
          if (isValidPassword) {
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.number,
            };
          }
          return null;
        }

        // Create new user
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await db.user.create({
            data: {
              number: phone,
              password: hashedPassword,
            },
          });

          return {
            id: newUser.id.toString(),
            name: newUser.name,
            email: newUser.number,
          };
        } catch (error) {
          console.error("Error creating user:", error);
          return null;
        }
      },
    }),
  ],

  secret: process.env.JWT_SECRET || "secret",

  callbacks: {
    async session({ token, session }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
