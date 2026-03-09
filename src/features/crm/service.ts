import { CrmRepository } from "./repository";

export async function loadCrmWorkspace(repository: CrmRepository) {
  const [metrics, prospects, clients, threads] = await Promise.all([
    repository.getDashboardMetrics(),
    repository.listProspects(10, 0),
    repository.listClients(10, 0),
    repository.listInboxThreads(10),
  ]);

  return {
    metrics,
    prospects,
    clients,
    threads,
  };
}
