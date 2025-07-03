import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { api } from "../services/api";

interface Item {
  id: number;
  name?: string;
  icon?: string;
  imageItem?: string;
  imageCollection?: string;
  description?: string;
  weight?: number;
  slots?: number;
  equipJobs?: string[] | number[];
}

/* ───────────────── query util ───────────────── */
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

/* ───────────────── mapa de ramos & evoluções ─────────────────
   Ordem fixa (6 colunas) → [1ª, 2ª, R1, R2, 3ª, 4ª].
*/
type Evol = [number, number, number, number, number, number?];
type Row  = { key: string; labelPt: string; ids: Evol };

const JOBS: Row[] = [
  { key: "swordman", labelPt: "Espadachins", ids: [10, 20, 4002, 4001, 4054, 4204] },
  { key: "mage",     labelPt: "Magos",       ids: [20, 21, 4005, 4006, 4056, 4206] },
  { key: "archer",   labelPt: "Arqueiros",   ids: [30, 31, 4007, 4009, 4059, 4209] },
  { key: "merchant", labelPt: "Mercadores",  ids: [50, 51, 4014, 4016, 4068, 4212] },
  { key: "thief",    labelPt: "Gatunos",     ids: [40, 41, 4009, 4011, 4058, 4208] },
  { key: "acolyte",  labelPt: "Sacerdotes",  ids: [60, 61, 4017, 4018, 4072, 4216] },
  { key: "soul",     labelPt: "Espiritualistas", ids: [4046, 4046, 4046, 4046, 4096, 4250] },
  { key: "ninja",    labelPt: "Ninjas",          ids: [4211, 4211, 4211, 4211, 4264] },
];

/* gera url do ícone */
const iconUrl = (id: number | undefined) =>
  id !== undefined
    ? `https://static.divine-pride.net/images/jobs/icon_jobs_${id}.png`
    : null;

/* ───────────────── extração de ramos permitidos ───────────────── */
function allowedBranches(item: Item): Set<string> {
  /* 1) Se backend trouxer equipJobs numérico → já mapeia          */
  if (Array.isArray(item.equipJobs) && item.equipJobs.some((v) => typeof v === "number")) {
    const nums = new Set(item.equipJobs.filter((v): v is number => typeof v === "number"));
    return new Set(
      JOBS.filter((row) =>
        row.ids.filter((id): id is number => typeof id === "number").some((id) => nums.has(id))
      ).map((r) => r.key)
    );
  }

  /* 2) Caso contrário, tenta extrair texto da descrição           */
  const desc = item.description?.toLowerCase() || "";
  const branches = new Set<string>();
  JOBS.forEach((row) => {
    if (desc.includes(row.labelPt.toLowerCase().split(",")[0]) || desc.includes(row.key)) {
      branches.add(row.key);
    }
  });
  return branches;
}

/* ───────────────── componente ───────────────── */
export default function SearchResultsPage() {
  const qs   = useQuery();
  const q    = qs.get("q") || "";
  const id   = qs.get("id") || "";

  const [items,   setItems]   = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q && !id) return;
    setLoading(true);
    api
      .get("/api/items/search", { params: q ? { q } : { id } })
      .then((r) => {
        const arr = Array.isArray(r.data)
          ? r.data
          : Array.isArray(r.data?.results)
          ? r.data.results
          : [r.data];
        setItems(arr);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [q, id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Resultado&nbsp;
        {q && <>para “{q}”</>}
        {id && <>para ID {id}</>}
      </h1>

      {loading ? (
        <p>Carregando…</p>
      ) : items.length ? (
        <ul className="grid gap-4">
          {items.map((it) => {
            const allowed = allowedBranches(it);

            return (
              <li key={it.id} className="bg-white shadow p-4 rounded space-y-3">
                {/* — título — */}
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {(it.imageItem || it.icon) && (
                    <img
                      src={it.imageItem || it.icon}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  {it.name || `Item ${it.id}`}{" "}
                  <span className="text-sm text-gray-500">#{it.id}</span>
                </h2>

                {/* — corpo — */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    {it.description && (
                      <p className="text-sm whitespace-pre-line mb-3">
                        {it.description}
                      </p>
                    )}

                    {/* grade de ícones  */}
                    <div className="space-y-1 mb-2">
                      {JOBS.map((row) => (
                        <div key={row.key} className="flex gap-1">
                          {row.ids.map((id, idx) => {
                            const url = iconUrl(id);
                            if (!url) return null;
                            const enabled = allowed.has(row.key);
                            return (
                              <img
                                key={idx}
                                src={url}
                                className={
                                  enabled
                                    ? "w-6 h-6"
                                    : "w-6 h-6 opacity-25 grayscale"
                                }
                                title={row.labelPt}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* atributos básicos */}
                    <div className="text-xs text-gray-500 flex gap-4 flex-wrap">
                      {it.weight && <span>Peso: {it.weight}</span>}
                      {it.slots !== undefined && <span>Slots: {it.slots}</span>}
                    </div>
                  </div>

                  {it.imageCollection && (
                    <img
                      src={it.imageCollection}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Nenhum item encontrado.</p>
      )}

      <Link to="/" className="inline-block mt-6 text-blue-600 underline">
        ← Voltar
      </Link>
    </div>
  );
}
