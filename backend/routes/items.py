"""
routes/items.py
Fontes:
  • Divine-Pride
  • RagnaAPI (opcional)

Retorna também:
  • classIcons : [url, ...]  – ícones das classes permitidas
"""
from __future__ import annotations
import functools, logging
from typing import Any, Dict, List, Optional

import requests
from flask import Blueprint, jsonify, request
from config import Config
from services.ragnapi_api import get_item as ragna_item

bp  = Blueprint("items", __name__)
log = logging.getLogger(__name__)

DP_API    = "https://www.divine-pride.net/api/database"
IMG_ITEMS = "https://www.divine-pride.net/img/items"
IMG_JOBS  = "https://static.divine-pride.net/images/jobs/icon_jobs_"
HEADERS   = {"User-Agent": "RagnaList/1.0 (+https://ragna-list.com)"}

# ───────── mapa simples nome → ID ─────────
JOB_NAME_TO_ID: Dict[str, int] = {
    "novice": 0,
    "swordman": 10,
    "knight": 20,
    "crusader": 21,
    "mage": 20,
    "wizard": 21,
    "archer": 30,
    "hunter": 31,
    "thief": 40,
    "assassin": 41,
    "merchant": 50,
    "blacksmith": 51,
    "acolyte": 60,
    "priest": 61,
    # adicione mais se precisar
}

def job_icon(job: int | str) -> Optional[str]:
    if isinstance(job, int):
        return f"{IMG_JOBS}{job}.png"
    jid = JOB_NAME_TO_ID.get(str(job).lower())
    return f"{IMG_JOBS}{jid}.png" if jid is not None else None

# ───────── helpers HTTP ─────────
def safe_json(r: requests.Response) -> Optional[dict | list]:
    try:
        return r.json()
    except Exception:
        log.warning("Resposta NÃO-JSON de %s (%s)", r.url, r.status_code)
        return None

def safe_get(url: str, **kw) -> Optional[dict | list]:
    try:
        return safe_json(requests.get(url, headers=HEADERS, timeout=10, **kw))
    except requests.RequestException as e:
        log.warning("Falha GET %s – %s", url, e)
        return None

# ───────── Divine-Pride ─────────
@functools.lru_cache(4096)
def dp_item(item_id: int) -> Optional[dict]:
    return safe_get(
        f"{DP_API}/item/{item_id}",
        params={"apiKey": Config.DIVINE_PRIDE_API_KEY},
    )

@functools.lru_cache(1024)
def dp_search(term: str, limit: int = 10) -> List[dict]:
    def norm(lst: list) -> List[dict]:
        return [
            {
                "id": it.get("id"),
                "name": it.get("name"),
                "icon": it.get("iconUrl") or it.get("image"),
            }
            for it in lst[:limit] if isinstance(it, dict)
        ]

    fast = safe_get(f"{DP_API}/Item",
                    params=dict(name=term, limit=limit,
                                apiKey=Config.DIVINE_PRIDE_API_KEY))
    if isinstance(fast, list) and fast:
        return norm(fast)

    slow = safe_get(f"{DP_API}/item",
                    params=dict(search=term, limit=limit,
                                apiKey=Config.DIVINE_PRIDE_API_KEY))
    return norm(slow) if isinstance(slow, list) else []

# ───────── Combinar fontes ───────
def fetch_full_item(item_id: int, name_fallback: str | None = None) -> Dict[str, Any]:
    item: Dict[str, Any] = {"id": item_id, "sources": []}

    # Divine-Pride detalhes
    if dp := dp_item(item_id):
        allowed = dp.get("equipJobs")
        item.update({
            "name": dp.get("name"),
            "description": dp.get("description"),
            "weight": dp.get("weight"),
            "class": dp.get("typeName"),
            "defense": dp.get("defense"),
            "attack": dp.get("attack"),
            "matk": dp.get("matk"),
            "equipLocations": dp.get("equipLocationNames"),
            "requiredLevel": dp.get("equipLevel"),
            "allowedClasses": allowed,
            "icon": dp.get("iconUrl"),
            "script": dp.get("script"),
            "tradeable": dp.get("isTradable"),
            "refinable": dp.get("isRefinable"),
            "drops": [
                {
                    "monsterId": d["monsterId"],
                    "monsterName": d["monsterName"],
                    "rate": d["chance"],
                }
                for d in (dp.get("dropDrops") or [])
            ],
            "vendors": [
                {
                    "npcId": s["npcId"],
                    "npcName": s["npcName"],
                    "price": s["price"],
                }
                for s in (dp.get("buyShops") or [])
            ],
        })
        item["sources"].append("Divine-Pride")
    else:
        allowed = None

    # RagnaAPI complementar
    if rg := ragna_item(item_id):
        item.update({
            "sellPrice": rg.get("sell"),
            "buyPrice": rg.get("buy"),
            "position": rg.get("position"),
        })
        item["sources"].append("RagnaAPI")

    # URLs de imagens
    item["imageItem"]       = f"{IMG_ITEMS}/item/bRO/{item_id}"
    item["imageCollection"] = f"{IMG_ITEMS}/collection/bRO/{item_id}"

    # Ícones das classes
    if allowed:
        icons = [job_icon(j) for j in allowed if job_icon(j)]
        if icons:
            item["classIcons"] = icons

    item.setdefault("name", name_fallback or f"Item {item_id}")
    item.setdefault("description", "")
    return item

# ───────── Rota principal ────────
@bp.get("/search")
def search_items():
    q       = (request.args.get("q") or "").strip()
    item_id = request.args.get("id", type=int)
    limit   = max(1, min(request.args.get("limit", 10, type=int), 20))

    if q.isdigit() and not item_id:
        item_id = int(q)

    if item_id:
        return jsonify(fetch_full_item(item_id)), 200

    if not q:
        return jsonify([]), 200

    results = [
        fetch_full_item(h["id"], h["name"])
        for h in dp_search(q, limit)
    ]
    return jsonify(results), 200
