// AppProviders.js
import { PostProvider } from '../data/contextData';
import { UserProvider } from '../contexts/UserContext';
import { RoleProvider } from '../data/roleData';

export default function AppProviders({ children }) {
  return (
    <RoleProvider>
      <PostProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </PostProvider>
    </RoleProvider>
  );
}
