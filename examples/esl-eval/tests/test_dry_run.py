"""Keyless end-to-end dry run. Uses MOCK models only; nothing here is a model result."""
import csv, json, pathlib, subprocess, sys, shutil
ROOT = pathlib.Path(__file__).resolve().parent.parent
RUN = "pytest-dryrun"

def sh(*args):
    r = subprocess.run([sys.executable, *args], cwd=ROOT, capture_output=True, text=True)
    assert r.returncode == 0, r.stdout + r.stderr
    return r.stdout

def test_tasks_well_formed():
    tasks = [json.loads(l) for l in (ROOT / "tasks/tasks.jsonl").read_text().splitlines()]
    assert 8 <= len(tasks) <= 10
    for t in tasks:
        for k in ("id", "category", "prompt", "expected_answer", "rubric", "edge_case_note", "verification_status", "pass_threshold"):
            assert k in t, (t["id"], k)
        assert sum(c["weight"] for c in t["rubric"]) > 0
        for c in t["rubric"]:
            assert c["type"] in ("deterministic", "judge")
            if c["type"] == "judge":
                assert c["pass_if"] and c["fail_if"]
        assert "expected_answer" not in t["prompt"]

def test_graders_accept_reference_and_reject_wrong():
    out = sh("grade.py", "--validate-references", "--mock-judge")
    assert "ALL GRADER CHECKS OK" in out

def test_end_to_end_mock():
    d = ROOT / "results/mock" / RUN
    shutil.rmtree(d, ignore_errors=True)
    sh("run_eval.py", "--mock", "--trials", "2", "--run-id", RUN)
    sh("grade.py", f"results/mock/{RUN}", "--mock-judge", "--judge-repeats", "2")
    rows = {r["model"]: r for r in csv.DictReader(open(d / "graded/summary_by_model.csv"))}
    assert float(rows["mock/reference"]["pass_rate"]) == 1.0
    assert float(rows["mock/wrong"]["pass_rate"]) == 0.0
    assert "MOCK DRY RUN" in (d / "graded/summary.md").read_text()
    assert not (ROOT / "results/raw" / RUN).exists()   # mock never writes to real results
