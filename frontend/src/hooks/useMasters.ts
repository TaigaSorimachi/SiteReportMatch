import { useState, useEffect } from 'react';
import { mastersApi } from '@/lib/api/masters';
import type { WorkType, StructureMaster, LicenseMaster, AccountMaster } from '@/types/api';

interface MastersData {
  workTypes: WorkType[];
  structures: StructureMaster[];
  licenses: LicenseMaster[];
  accounts: AccountMaster[];
}

let cache: MastersData | null = null;

export function useMasters() {
  const [data, setData] = useState<MastersData | null>(cache);
  const [isLoading, setIsLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    (async () => {
      try {
        const [workTypes, structures, licenses, accounts] = await Promise.all([
          mastersApi.getWorkTypes(),
          mastersApi.getStructures(),
          mastersApi.getLicenses(),
          mastersApi.getAccounts(),
        ]);
        cache = { workTypes, structures, licenses, accounts };
        setData(cache);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { data, isLoading };
}
