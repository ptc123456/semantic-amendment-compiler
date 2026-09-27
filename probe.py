# v0.3.0
# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }
import genlayer as gl
from genlayer.types import *
class Probe(gl.contract.Contract):
    value: u256
    def __init__(self, initial: u256):
        self.value = initial
    @gl.public.view
    def get(self) -> u256:
        return self.value
    @gl.public.write
    def set(self, value: u256) -> None:
        self.value = value
