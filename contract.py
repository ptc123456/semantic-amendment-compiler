# v0.3.0
# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }
import genlayer as gl
from genlayer.types import *

MAX_TEXT = 16384

if not hasattr(gl.vm, "run_nondet_unsafe"):
    def _run_nondet_unsafe(leader_fn, validator_fn):
        return gl.vm.run_nondet_default(leader_fn, validator_fn)
    gl.vm.run_nondet_unsafe = _run_nondet_unsafe

class SemanticAmendmentCompiler(gl.contract.Contract):
    state: str
    proposer: str
    co_signer: str
    draft: str
    counter_text: str
    outcome: str
    result_json: str
    nonce: str
    revision: u256
    attempts: u256
    last_attempt: u256
    history_json: str

    def __init__(self):
        self.state = "EMPTY"
        self.proposer = ""
        self.co_signer = ""
        self.draft = ""
        self.counter_text = ""
        self.outcome = ""
        self.result_json = ""
        self.nonce = ""
        self.revision = 0
        self.attempts = 0
        self.last_attempt = 0
        self.history_json = "[]"

    @gl.public.write
    def create_case(self, draft: str, co_signer: str, nonce: str) -> None:
        if self.state != "EMPTY":
            raise gl.vm.UserError("case already exists")
        if not draft or len(draft.encode("utf-8")) > MAX_TEXT:
            raise gl.vm.UserError("draft bounds")
        if not co_signer or not nonce:
            raise gl.vm.UserError("missing actor or nonce")
        self.proposer = str(gl.message.sender_address)
        self.co_signer = co_signer
        self.draft = draft
        self.nonce = nonce
        self.state = "DRAFT"
        self.revision = 1
        self.history_json = "[\"DRAFT\"]"

    @gl.public.write
    def counter(self, text: str) -> None:
        if self.state != "DRAFT":
            raise gl.vm.UserError("wrong state")
        if str(gl.message.sender_address) != self.co_signer:
            raise gl.vm.UserError("unauthorized")
        if not text or len(text.encode("utf-8")) > MAX_TEXT:
            raise gl.vm.UserError("counter bounds")
        self.counter_text = text
        self.state = "COUNTERED"
        self.revision += 1
        self.history_json = self.history_json[:-1] + ",\"COUNTERED\"]"

    @gl.public.write
    def freeze(self) -> None:
        if self.state not in ("DRAFT", "COUNTERED"):
            raise gl.vm.UserError("wrong state")
        if str(gl.message.sender_address) != self.proposer:
            raise gl.vm.UserError("unauthorized")
        self.state = "FROZEN"
        self.revision += 1
        self.history_json = self.history_json[:-1] + ",\"FROZEN\"]"

    @gl.public.write
    def evaluate(self) -> str:
        if self.state != "FROZEN":
            raise gl.vm.UserError("wrong state")
        draft = self.draft
        counter = self.counter_text
        prompt = "Return only JSON with keys decision, reason_code, evidence_hash. Compare amendment text.\nDRAFT:\n" + draft + "\nCOUNTER:\n" + counter
        def leader_fn():
            return gl.nondet.exec_prompt(prompt)
        def validator_fn(leader_result):
            if not isinstance(leader_result, gl.vm.Return):
                return False
            value = leader_result.calldata
            return isinstance(value, str) and len(value) <= 2048 and value.startswith("{")
        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        self.result_json = str(result)
        self.outcome = "UNRESOLVED"
        self.state = "UNRESOLVED"
        self.attempts += 1
        self.revision += 1
        self.history_json = self.history_json[:-1] + ",\"UNRESOLVED\"]"
        return self.result_json

    @gl.public.write
    def retry(self) -> None:
        if self.state != "UNRESOLVED" or self.attempts >= 3:
            raise gl.vm.UserError("retry unavailable")
        self.state = "FROZEN"
        self.revision += 1

    @gl.public.view
    def get_history(self) -> str:
        return self.history_json

    @gl.public.view
    def list_cases(self) -> dict:
        return {"state": self.state, "revision": self.revision}

    @gl.public.view
    def get_case(self) -> dict:
        return {"state": self.state, "proposer": self.proposer, "co_signer": self.co_signer, "draft": self.draft, "counter": self.counter_text, "outcome": self.outcome, "result": self.result_json, "revision": self.revision, "attempts": self.attempts}
