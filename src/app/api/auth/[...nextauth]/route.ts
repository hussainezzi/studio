import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signUpAction } from "../../../../../src/actions/authActions"; // Import your auth logic

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Replace this with your own logic
        const { username, password } = credentials as { username: string; password: string };
        const result = await signUpAction({
            username, password,
            name: null,
            email: null
        });
        if (result.success) {
          return { id: username.toString(), name: username, username }; // Ensure id is a string
        }
        throw new Error(result.error || "Invalid credentials");
      },
    }),
  ],
  trustHost: true, // Explicitly trust the host
});

export { handler as GET, handler as POST };