from pathlib import Path

SOURCE = Path(__file__).parents[1] / "contract.py"
TEXT = SOURCE.read_text(encoding="utf-8")


def test_studio_next_pin_and_methods():
    assert "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" in TEXT
    for method in ("create_case", "counter", "freeze", "evaluate", "retry", "get_case", "get_history", "list_cases"):
        assert f"def {method}(" in TEXT


def test_authority_and_fail_closed_guards_present():
    assert "gl.message.sender_address" in TEXT
    assert "state != \"FROZEN\"" in TEXT
    assert "state != \"UNRESOLVED\"" in TEXT
    assert "attempts >= 3" in TEXT
    assert "gl.vm.run_nondet_unsafe" in TEXT
    assert "isinstance(leader_result, gl.vm.Return)" in TEXT


def test_bounds_and_readback_fields_present():
    assert "MAX_TEXT = 16384" in TEXT
    for field in ("revision", "attempts", "result_json", "history_json"):
        assert f"    {field}:" in TEXT
