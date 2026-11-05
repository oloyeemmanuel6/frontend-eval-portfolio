"""Shared helpers: config, tasks, OpenRouter client, mock models, JSON extraction."""
import json, os, re, time, hashlib, pathlib
import requests

ROOT = pathlib.Path(__file__).resolve().parent.parent
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MOCK_PREFIX = "mock/"

def load_config(path=None):
    return json.loads(pathlib.Path(path or ROOT / "config.json").read_text())

def load_tasks(path=None, ids=None):
    tasks = [json.loads(l) for l in pathlib.Path(path or ROOT / "tasks" / "tasks.jsonl").read_text().splitlines() if l.strip()]
    if ids:
        tasks = [t for t in tasks if t["id"] in ids]
    return tasks

def slug(model_id):
    return re.sub(r"[^A-Za-z0-9._-]+", "_", model_id)

def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()[:16]

def get_api_key():
    try:
        from dotenv import load_dotenv
        load_dotenv(ROOT / ".env")
    except ImportError:
        pass
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key:
        raise SystemExit("OPENROUTER_API_KEY is not set (see .env.example). Use --mock for a keyless dry run.")
    return key

def model_catalog():
    """Return {model_id: model_info} from OpenRouter (public endpoint, no key needed)."""
    r = requests.get("https://openrouter.ai/api/v1/models", timeout=60)
    r.raise_for_status()
    return {m["id"]: m for m in r.json()["data"]}

class QuotaExhausted(RuntimeError):
    """Free-model daily request quota used up: stop and resume tomorrow (no retry)."""

class PaidCallDetected(RuntimeError):
    """A call reported a non-zero cost: abort immediately."""

_last_call = [0.0]

def free_quota_remaining():
    """Remaining free-model requests today, read from OpenRouter's key endpoint (not a model request)."""
    r = requests.get("https://openrouter.ai/api/v1/key", headers={"Authorization": f"Bearer {get_api_key()}"}, timeout=30)
    r.raise_for_status()
    q = r.json()["data"].get("free_model_daily_requests") or {}
    return q.get("remaining"), q.get("limit")

def chat(model, messages, temperature=0, max_tokens=2000, timeout=300, retries=3, extra=None):
    """One OpenRouter chat call. Returns dict with text, returned model id, usage, raw response."""
    if model.startswith(MOCK_PREFIX):
        return mock_chat(model, messages)
    cfg = load_config()
    if cfg.get("free_only") and not model.endswith(":free"):
        raise PaidCallDetected(f"free_only is set but {model} is not a ':free' model")
    key = get_api_key()
    body = {"model": model, "messages": messages, "temperature": temperature,
            "max_tokens": max_tokens, "usage": {"include": True}}
    if extra:
        body.update(extra)
    # The previous referer was the placeholder https://github.com/esl-eval.
    # That URL is not a repository Dami owns. This copy uses a non-resolving
    # address so the file does not name a GitHub account.
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json",
               "HTTP-Referer": "https://example.invalid/esl-teaching-judgment-eval",
               "X-Title": "ESL Teaching Judgment Eval"}
    last = None
    for attempt in range(retries + 1):
        if cfg.get("free_only"):
            rem, lim = free_quota_remaining()
            if rem is not None and rem <= 0:
                raise QuotaExhausted(f"free-model daily quota used ({lim}/day)")
            gap = cfg.get("min_seconds_between_calls", 0) - (time.time() - _last_call[0])
            if gap > 0:
                time.sleep(gap)
        try:
            t0 = time.time()
            _last_call[0] = t0
            r = requests.post(OPENROUTER_URL, headers=headers, json=body, timeout=timeout)
            latency = time.time() - t0
            if r.status_code == 429 and any(w in r.text.lower() for w in ("per-day", "per day", "daily", "free-models-per-day")):
                raise QuotaExhausted(f"HTTP 429 daily limit: {r.text[:200]}")
            if r.status_code in (429, 500, 502, 503, 504):
                last = f"HTTP {r.status_code}: {r.text[:300]}"
                time.sleep(2 ** attempt * 10)
                continue
            if 400 <= r.status_code < 500:   # 400/401/402/403/404: not retryable (e.g. 402 = out of credits)
                raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
            data = r.json()
            if "error" in data:
                last = f"API error: {data['error']}"
                time.sleep(2 ** attempt * 3)
                continue
            cost = (data.get("usage") or {}).get("cost") or 0
            if cfg.get("free_only") and cost > 0:
                raise PaidCallDetected(f"{model} reported cost {cost}")
            msg = data["choices"][0]["message"]
            return {"text": msg.get("content") or "", "reasoning": msg.get("reasoning"),
                    "returned_model": data.get("model"), "provider": data.get("provider"),
                    "usage": data.get("usage"), "finish_reason": data["choices"][0].get("finish_reason"),
                    "latency_s": round(latency, 2), "generation_id": data.get("id")}
        except requests.RequestException as e:
            last = f"{type(e).__name__}: {e}"
            time.sleep(2 ** attempt * 10)
    raise RuntimeError(f"OpenRouter call failed for {model}: {last}")

# ---------------- mock models (dry run only; never part of results) ----------------
def _task_id_from_messages(messages):
    m = re.search(r"\[TASK_ID:(T\d+)\]", messages[-1]["content"])
    return m.group(1) if m else None

def mock_chat(model, messages):
    """mock/reference returns the reference answer; mock/wrong returns the deliberately wrong one;
    mock/judge-reference is a judge that PASSes only text identical to the reference answer."""
    if model == "mock/judge-reference":
        content = messages[-1]["content"]
        ok = "[MOCK_IS_REFERENCE:yes]" in content
        text = json.dumps({"verdict": "PASS" if ok else "FAIL", "evidence": "", "reason": "MOCK JUDGE (dry run only)"})
    else:
        tid = _task_id_from_messages(messages)
        sub = {"mock/reference": "", "mock/wrong": "wrong/"}[model]
        text = (ROOT / "reference" / f"{sub}{tid}.md").read_text()
    return {"text": text, "reasoning": None, "returned_model": model, "provider": "MOCK",
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "cost": 0.0},
            "finish_reason": "stop", "latency_s": 0.0, "generation_id": "mock"}

# ---------------- JSON extraction ----------------
def extract_json(text):
    """Return the last JSON object in the text (prefers ```json fences). None if not parseable."""
    if not text:
        return None
    fences = re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", text, flags=re.S)
    for cand in reversed(fences):
        try:
            return json.loads(cand)
        except json.JSONDecodeError:
            pass
    # fallback: scan for last balanced {...}
    ends = [i for i, c in enumerate(text) if c == "}"]
    for end in reversed(ends):
        depth = 0
        for start in range(end, -1, -1):
            if text[start] == "}": depth += 1
            elif text[start] == "{":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start:end + 1])
                    except json.JSONDecodeError:
                        break
    return None
