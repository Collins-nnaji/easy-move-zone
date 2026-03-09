/**
 * Example server component for App Router.
 * Copy into your route file (e.g. app/crm/page.tsx or src/app/crm/page.tsx)
 * and replace `db` with your postgres client adapter.
 */

import { CrmRepository, type DbExecutor, loadCrmWorkspace } from "../index";
import { CrmWorkspace } from "../components/CrmWorkspace";

declare const db: DbExecutor;

export default async function CrmPage() {
  const repository = new CrmRepository(db);
  const data = await loadCrmWorkspace(repository);

  return (
    <CrmWorkspace
      metrics={data.metrics}
      prospects={data.prospects}
      clients={data.clients}
      threads={data.threads}
    />
  );
}
