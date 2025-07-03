"""
services/ragnapi_api.py
Wrapper simples para RagnaAPI.
"""

from __future__ import annotations
import functools, os, logging
from typing import Optional

import requests

log = logging.getLogger(__name__)

BASE    = os.getenv("RAGNA_API_BASE", "https://www.ragnaapi.com/api/v1")
HEADERS = {"User-Agent": "RagnaList/1.0 (+https://ragna-list.com)"}


def _safe_get(url: str, **kw) -> Optional[dict]:
    try:
        r = requests.get(url, headers=HEADERS, timeout=10, **kw)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        log.warning("RagnaAPI falhou %s – %s", url, e)
        return None


@functools.lru_cache(maxsize=4096)
def get_item(item_id: int) -> Optional[dict]:
    """Retorna dados crus do item ou None se offline/404."""
    return _safe_get(f"{BASE}/items/{item_id}")
