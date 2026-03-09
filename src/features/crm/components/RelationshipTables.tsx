import type { Client, Prospect } from "../types";

interface RelationshipTablesProps {
  prospects: Prospect[];
  clients: Client[];
}

export function RelationshipTables({ prospects, clients }: RelationshipTablesProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
      <section>
        <h3>Prospects</h3>
        <table width="100%" cellPadding={8}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Company</th>
              <th align="left">Lifecycle</th>
              <th align="left">Score</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((p) => (
              <tr key={p.id}>
                <td>{p.firstName} {p.lastName}</td>
                <td>{p.companyName ?? "-"}</td>
                <td>{p.lifecycle}</td>
                <td>{p.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Clients</h3>
        <table width="100%" cellPadding={8}>
          <thead>
            <tr>
              <th align="left">Company</th>
              <th align="left">Primary Contact</th>
              <th align="left">ARR</th>
              <th align="left">Renewal</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td>{c.companyName}</td>
                <td>{c.primaryContactName}</td>
                <td>${c.arrUsd.toLocaleString()}</td>
                <td>{c.renewalDate ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
