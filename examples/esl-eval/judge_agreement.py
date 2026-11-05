#!/usr/bin/env python3
"""Spot-check the LLM judge against human (expert) labels, and report judge stability.

1) Make a blind labelling sheet (judge verdicts hidden) from a graded run:
     python judge_agreement.py make-sheet results/graded/<run_id> --n 40
   -> human_labels/sheet_<run_id>.csv ; open each 'file', read the answer, fill human_verdict with PASS or FAIL.
2) Compare:
     python judge_agreement.py compare human_labels/sheet_<run_id>.csv results/graded/<run_id>
   -> agreement %, Cohen's kappa, confusion matrix, every disagreement, and judge flip rate (if graded with --judge-repeats >= 2).
"""
import argparse, csv, json, random, collections, pathlib
from esl_eval.common import ROOT, load_tasks

def read_csv(p):
    with open(p, newline="") as f:
        return list(csv.DictReader(f))

def final_judge_rows(graded):
    rows = [r for r in read_csv(pathlib.Path(graded) / "criteria.csv") if r["type"] == "judge"]
    seen = {}
    for r in rows:
        seen.setdefault((r["file"], r["criterion"]), r)
    return seen, rows

def make_sheet(graded, n, seed):
    tasks = {t["id"]: t for t in load_tasks()}
    finals, _ = final_judge_rows(graded)
    keys = sorted(k for k in finals if (finals[k].get("final_verdict") or finals[k]["verdict"]) not in ("PENDING", ""))
    random.Random(seed).shuffle(keys)
    # stratify roughly: try to include both judge PASS and FAIL
    passes = [k for k in keys if finals[k].get("final_verdict", finals[k]["verdict"]) == "PASS"]
    fails = [k for k in keys if k not in passes]
    pick = (passes[: n // 2] + fails[: n - min(len(passes), n // 2)])[:n]
    gp = pathlib.Path(graded); name = gp.parent.name if gp.name == "graded" else gp.name
    out = ROOT / "human_labels" / f"sheet_{name}.csv"
    with open(out, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["file", "task_id", "criterion", "criterion_description", "pass_if", "fail_if", "human_verdict", "human_note"])
        for file, cid in pick:
            r = finals[(file, cid)]
            c = next(c for c in tasks[r["task_id"]]["rubric"] if c["id"] == cid)
            w.writerow([file, r["task_id"], cid, c["description"], c["pass_if"], c["fail_if"], "", ""])
    print(f"Wrote {out.relative_to(ROOT)} with {len(pick)} rows. Fill human_verdict (PASS/FAIL) without looking at criteria.csv.")

def kappa(pairs):
    n = len(pairs)
    if n == 0: return float("nan")
    po = sum(a == b for a, b in pairs) / n
    labels = {x for p in pairs for x in p}
    ca, cb = collections.Counter(a for a, _ in pairs), collections.Counter(b for _, b in pairs)
    pe = sum(ca[l] * cb[l] for l in labels) / (n * n)
    return (po - pe) / (1 - pe) if pe < 1 else 1.0

def compare(sheet, graded):
    finals, allrows = final_judge_rows(graded)
    pairs, dis = [], []
    for r in read_csv(sheet):
        h = r["human_verdict"].strip().upper()
        if h not in ("PASS", "FAIL"):
            continue
        j = finals[(r["file"], r["criterion"])]
        jv = j.get("final_verdict") or j["verdict"]
        jv = jv if jv in ("PASS", "FAIL") else "FAIL"   # UNKNOWN counts as not-pass, same as in scoring
        pairs.append((h, jv))
        if h != jv:
            dis.append((r["file"], r["criterion"], h, jv, j["detail"][:160]))
    n = len(pairs)
    if not n:
        print("No human labels filled in yet."); return
    agree = sum(a == b for a, b in pairs) / n
    cm = collections.Counter(pairs)
    print(f"Labelled items: {n}\nAgreement: {agree:.1%}\nCohen's kappa: {kappa(pairs):.2f}")
    print(f"Confusion (human, judge): PASS/PASS={cm[('PASS','PASS')]} FAIL/FAIL={cm[('FAIL','FAIL')]} "
          f"false passes (human FAIL, judge PASS)={cm[('FAIL','PASS')]} false fails (human PASS, judge FAIL)={cm[('PASS','FAIL')]}")
    for d in dis:
        print("  DISAGREE", *d)
    by = collections.defaultdict(set)
    for r in allrows:
        by[(r["file"], r["criterion"])].add(r["verdict"])
    multi = [k for k, v in by.items() if sum(1 for r in allrows if (r["file"], r["criterion"]) == k) > 1]
    if multi:
        flips = sum(len(by[k]) > 1 for k in multi)
        print(f"Judge stability: {flips}/{len(multi)} judged items changed verdict across repeats ({flips/len(multi):.1%})")
    else:
        print("Judge stability: not measured (grade with --judge-repeats 2 to measure flips)")

def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("make-sheet"); a.add_argument("graded"); a.add_argument("--n", type=int, default=40); a.add_argument("--seed", type=int, default=0)
    b = sub.add_parser("compare"); b.add_argument("sheet"); b.add_argument("graded")
    args = ap.parse_args()
    make_sheet(args.graded, args.n, args.seed) if args.cmd == "make-sheet" else compare(args.sheet, args.graded)

if __name__ == "__main__":
    main()
