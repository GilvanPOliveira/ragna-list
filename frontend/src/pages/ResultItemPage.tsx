import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { api } from "../services/api";
import {
  BRANCHES,
  iconUrl,
  allowedIdSet,
} from "../utils/classIcons";

import { cleanDescription } from "../utils/description";

import "../styles/jobGrid.css";
import "../styles/searchResults.css";

/* ---------- tipos ---------- */
interface Item {
  id: number;
  name?: string;
  icon?: string;
  imageItem?: string;
  imageCollection?: string;
  description?: string;
  weight?: number;
  slots?: number;
  equipJobs?: (number | string)[];
  allowedClasses?: (number | string)[];
}
const useQuery = () => new URLSearchParams(useLocation().search);

/* ---------- mapa ID → ramo ---------- */
const ID_TO_BRANCH = (() => {
  const m = new Map<number, string>();
  BRANCHES.forEach((br) =>
    br.stages.flat().forEach((id) => id !== undefined && m.set(id, br.key))
  );
  return m;
})();

/* ---------- util rápido: só remove ^RRGGBB ---------- */
const stripColors = (s = "") => s.replace(/\^[0-9A-Fa-f]{6}/g, "");

/* ---------- fallback textual ---------- */
function branchesFromText(desc = ""): Set<string> {
  const out = new Set<string>();
  const d = stripColors(desc).toLowerCase();
  BRANCHES.forEach((br) => {
    if (d.includes(br.key) || d.includes(br.pt.toLowerCase())) out.add(br.key);
  });
  return out;
}

/* ---------- universal? ---------- */
function isUniversal(item: Item): boolean {
  if (
    Array.isArray(item.equipJobs) &&
    item.equipJobs.some(
      (j) =>
        typeof j === "string" && /all (jobs|classes)/i.test(j)
    )
  )
    return true;
  return /all (jobs|classes)/i.test(stripColors(item.description));
}

/* =============================================================== */
export default function ResultItemPage() {
  const q  = useQuery().get("q")  || "";
  const id = useQuery().get("id") || "";

  const [items, setItems]   = useState<Item[]>([]);
  const [loading, setLoad]  = useState(false);

  /* -------- fetch -------- */
  useEffect(() => {
    if (!q && !id) return;
    setLoad(true);
    api
      .get("/api/items/search", { params: q ? { q } : { id } })
      .then((r) => {
        const raw: Item[] = Array.isArray(r.data)
          ? r.data
          : Array.isArray(r.data?.results)
          ? r.data.results
          : [r.data];

        /* normaliza equipJobs → somente números */
        const arr = raw.map((it) => {
          const mix = [
            ...(it.equipJobs ?? []),
            ...(it.allowedClasses ?? []),
          ];
          const nums = mix
            .filter((v): v is number | string => v != null)
            .map((v) =>
              typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v
            )
            .filter((v): v is number => typeof v === "number");
          return { ...it, equipJobs: nums };
        });

        setItems(arr);
      })
      .catch(() => setItems([]))
      .finally(() => setLoad(false));
  }, [q, id]);

  /* -------- render -------- */
  return (
    <div className="search-page">
      <h1 className="search-title">
        Resultado&nbsp;
        {q && <>para “{q}”</>}
        {id && <>para ID {id}</>}
      </h1>

      {loading ? (
        <p className="loading">Carregando…</p>
      ) : items.length ? (
        <ul className="items-list">
          {items.map((it) => {
            /* ids / ramos permitidos */
            const allowedIds      = allowedIdSet(it);
            const allowedBranches = new Set<string>();

            allowedIds.forEach((id) => {
              const br = ID_TO_BRANCH.get(id);
              if (br) allowedBranches.add(br);
            });

            branchesFromText(it.description).forEach((b) =>
              allowedBranches.add(b)
            );

            if (isUniversal(it)) {
              BRANCHES.forEach((b) => allowedBranches.add(b.key));
            }

            return (
              <li key={it.id} className="item-card">
                {/* título */}
                <h2 className="item-title">
                  {(it.imageItem || it.icon) && (
                    <img
                      src={it.imageItem || it.icon}
                      className="item-icon"
                      alt=""
                    />
                  )}
                  {it.name || `Item ${it.id}`}{" "}
                  <span className="item-id">#{it.id}</span>
                </h2>

                {/* corpo */}
                <div className="item-body">
                  <div className="item-info">
                    {it.description && (
                      <p className="item-description">
                        {cleanDescription(it.description)}
                      </p>
                    )}

                    {/* grade de classes */}
                    <table className="job-grid">
                      <tbody>
                        {BRANCHES[0].stages.map((_, rowIdx) => (
                          <tr key={rowIdx}>
                            {BRANCHES.map((br) => (
                              <td key={br.key} className="job-cell">
                                <div className="job-cell-icons">
                                  {br.stages[rowIdx].map((iconId) => {
                                    const enabled =
                                      allowedIds.has(iconId) ||
                                      allowedBranches.has(br.key);
                                    return (
                                      <img
                                        key={iconId}
                                        src={iconUrl(iconId, enabled)}
                                        className={
                                          enabled
                                            ? "job-icon"
                                            : "job-icon disabled"
                                        }
                                        title={br.pt}
                                        alt=""
                                      />
                                    );
                                  })}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {it.imageCollection && (
                    <img
                      src={it.imageCollection}
                      className="collection-img"
                      alt=""
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="no-results">Nenhum item encontrado.</p>
      )}

      <Link to="/" className="back-link">
        ← Voltar
      </Link>
    </div>
  );
}
