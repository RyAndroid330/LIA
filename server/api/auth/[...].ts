import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NuxtAuthHandler } from '#auth';

export default NuxtAuthHandler({
  // A secret string you define, to ensure correct encryption
  secret: useRuntimeConfig().authSecret,
  providers: [
    CredentialsProvider.default({
      name: 'Credentials',
      async authorize(credentials: any) {
        try {
          const response = await fetch(
            `${process.env.AUTH_ORIGIN}/api/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: credentials?.username,
                password: credentials?.password
              })
            }
          );

          console.log('Raw response from login API:', response);

          if (!response.ok) {
            console.error('Login failed:', response.statusText);
            return null;
          }

          const data = await response.json();
          console.log('Parsed response data:', data);

          if (data.success) {
            return data.user;
          } else {
            console.error('Login failed:', data.message);
            return null;
          }
        } catch (error) {
          console.error('Error during login API call:', error);
          return null;
        }
      }
    }),
    // @ts-expect-error Use .default here for it to work during SSR.
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {}
});
