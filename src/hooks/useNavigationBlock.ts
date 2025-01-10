import { useCallback, useEffect, useState } from 'react';
import { useBeforeUnload } from 'react-router-dom';

export function useNavigationBlock(shouldBlock: boolean) {
  const [isBlocking, setIsBlocking] = useState(false);
  
  // Update blocking state when shouldBlock changes
  useEffect(() => {
    setIsBlocking(shouldBlock);
  }, [shouldBlock]);

  // Use beforeunload event to prevent navigation
  useBeforeUnload(
    useCallback(
      (event) => {
        if (isBlocking) {
          event.preventDefault();
          return '';
        }
      },
      [isBlocking]
    )
  );

  // Function to manually unblock navigation
  const unblock = useCallback(() => {
    setIsBlocking(false);
  }, []);

  return { isBlocking, unblock };
}
