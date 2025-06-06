// AppProviders.js
import { PostProvider } from '../data/contextData';
import { UserProvider } from '../contexts/UserContext';

export default function AppProviders({ children }) {
  return (
      <PostProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </PostProvider>
  );
}
