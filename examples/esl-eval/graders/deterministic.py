"""Code-based checks. Each returns credit in [0, 1] plus a short detail string."""
import re

CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"]
ZERO_TOKENS = {"zero", "ø", "∅", "(nothing)", "nothing", "-", "—", "(none)", "none", "no word", "(zero)", "blank", ""}

def get_path(obj, path):
    cur = obj
    for part in path.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        elif isinstance(cur, dict) and part.isdigit() and int(part) in cur:
            cur = cur[int(part)]
        else:
            return None
    return cur

def _norm_label(v):
    return re.sub(r"[^A-Z_]", "", str(v).upper().replace(" ", "_")) if v is not None else None

def _norm_answer(v):
    s = str(v).strip().lower().strip(".,;:!\"'`")
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\b(i|you|we|they)'ve\b", r"\1 have", s).replace("'ve ", " have ")
    if s in ZERO_TOKENS or "zero" in s or "no relative" in s or "omit" in s or "leave" in s and "empty" in s:
        return "zero"
    return s

def _norm_level(v):
    m = re.search(r"\b([ABC][12])\b", str(v or "").upper())
    return m.group(1) if m else None

def run_check(crit, parsed, task):
    """parsed: JSON object extracted from the response (or None)."""
    if parsed is None:
        return 0.0, "no parseable JSON block"
    c = crit["check"]
    flags = re.I if "i" in crit.get("flags", "") else 0
    if c == "labels_match":
        got = get_path(parsed, crit["field"]) or {}
        exp = get_path(task["expected_answer"], crit["field"])
        ok = [k for k in crit["keys"] if isinstance(got, dict) and _norm_label(got.get(k)) == _norm_label(exp[k])]
        frac = len(ok) / len(crit["keys"])
        credit = frac if crit.get("partial") else float(frac == 1.0)
        bad = [f"{k}:{(got or {}).get(k) if isinstance(got, dict) else None}!={exp[k]}" for k in crit["keys"] if k not in ok]
        return credit, f"{len(ok)}/{len(crit['keys'])} correct" + (f"; wrong {bad}" if bad else "")
    if c in ("field_regex", "field_regex_absent"):
        val = get_path(parsed, crit["field"])
        val = "" if val is None else str(val)
        hit = re.search(crit["pattern"], val, flags) is not None
        ok = hit if c == "field_regex" else not hit
        return float(ok), f"{'matched' if hit else 'no match'} /{crit['pattern']}/ in {val[:80]!r}"
    if c == "field_in":
        lvl = _norm_level(get_path(parsed, crit["field"]))
        return float(lvl in crit["allowed"]), f"got {lvl}, allowed {crit['allowed']}"
    if c == "level_order":
        a, b = (_norm_level(get_path(parsed, f)) for f in crit["fields"])
        ok = a in CEFR and b in CEFR and CEFR.index(b) > CEFR.index(a)
        return float(ok), f"{a} < {b}: {ok}"
    if c == "set_equals":
        got = get_path(parsed, crit["field"])
        if isinstance(got, str):
            got = re.split(r"\s*(?:,|/|;|\bor\b)\s*", got)
        got = {_norm_answer(x) for x in (got or [])}
        exp = {_norm_answer(x) for x in crit["expected"]}
        ok = got == exp
        return float(ok), f"got {sorted(got)}; expected {sorted(exp)}" + ("" if ok else f"; missing {sorted(exp-got)} extra {sorted(got-exp)}")
    if c == "word_count_max":
        val = str(get_path(parsed, crit["field"]) or "")
        n = len(val.split())
        return float(0 < n <= crit["max"]), f"{n} words (max {crit['max']})"
    raise ValueError(f"unknown check {c}")
