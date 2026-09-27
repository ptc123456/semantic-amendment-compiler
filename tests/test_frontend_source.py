from pathlib import Path

TEXT = (Path(__file__).parents[1] / "src" / "main.js").read_text(encoding="utf-8")


def test_frontend_targets_studio_next():
    assert "https://studio-dev.genlayer.com/api" in TEXT
    assert "CHAIN=61997" in TEXT
    assert "Wrong network" in TEXT


def test_frontend_retains_hash_until_finality_and_readback():
    assert "tx.hash" in TEXT
    assert "await tx.wait()" in TEXT
    assert "readState()" in TEXT


def test_frontend_rejects_unbound_wallet_and_invalid_address():
    assert "No injected wallet detected" in TEXT
    assert "Invalid contract address" in TEXT
    assert "Awaiting wallet signature" in TEXT
