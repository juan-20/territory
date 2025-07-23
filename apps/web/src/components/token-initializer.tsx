'use client';

import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@territory/backend/convex/_generated/api';

export function TokenInitializer() {
  const initToken = useMutation(api.territory.initializeToken);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_TOKEN;
    if (token) {
      initToken({ token });
    }
  }, [initToken]);

  return null;
}
