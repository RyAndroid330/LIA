import GoogleProvider from 'next-auth/providers/google';
import { NuxtAuthHandler } from '#auth';

export default NuxtAuthHandler({
  // A secret string you define, to ensure correct encryption
  secret: useRuntimeConfig().authSecret,
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async signOut() {
      try {
        const auth2 = gapi.auth2.getAuthInstance();
        if (auth2) {
          await auth2.signOut();
          return true;
        } else {
          console.error('Google Auth instance not found');
          return false;
        }
      } catch (error) {
        console.error('Error signing out:', error);
        return false;
      }
    }
  }
});
