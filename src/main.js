import {BrowserProvider, Contract, getAddress, isAddress} from "ethers";
import "./style.css";

const RPC="https://studio-dev.genlayer.com/api", CHAIN=61997;
const ABI = [
  "function create_case(string draft,string co_signer,string nonce)",
  "function counter(string text)",
  "function freeze()",
  "function evaluate() returns (string)",
  "function retry()",
  "function get_case() view returns (tuple(string state,string proposer,string co_signer,string draft,string counter,string outcome,string result,uint256 revision,uint256 attempts))"
];
let provider, signer, contract, currentCase;
const $ = id => document.getElementById(id);
const status = message => { $("status").textContent = message; };

async function verifyNetwork() {
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== CHAIN) throw Error(`Wrong network: ${network.chainId}. Switch to Studio Next (61997).`);
  $("network").textContent = `Studio Next · ${CHAIN}`;
}

function ready() {
  const configured = Boolean(contract);
  $("create").disabled = !configured;
  $("read").disabled = !configured;
  for (const id of ["counterAction", "freeze", "evaluate", "retry"]) $(id).disabled = !configured;
  if (!currentCase) return;
  $("create").disabled = currentCase.state !== "EMPTY";
  $("counterAction").disabled = currentCase.state !== "DRAFT";
  $("freeze").disabled = !["DRAFT", "COUNTERED"].includes(currentCase.state);
  $("evaluate").disabled = currentCase.state !== "FROZEN";
  $("retry").disabled = currentCase.state !== "UNRESOLVED";
}

$("connect").onclick = async () => {
  try {
    if (!window.ethereum) throw Error("No injected wallet detected.");
    provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    await verifyNetwork();
    signer = await provider.getSigner();
    $("wallet").textContent = `${(await signer.getAddress()).slice(0, 10)}…`;
    if ($("address").value.trim()) $("address").dispatchEvent(new Event("change"));
    status("Wallet bound. Enter the deployed contract address.");
    ready();
  } catch (error) { status(error.message); }
};

$("address").onchange = () => {
  try {
    const address = getAddress($("address").value.trim());
    contract = new Contract(address, ABI, signer || provider);
    currentCase = undefined;
    ready();
    status("Contract configured. Writes require the connected wallet.");
  } catch { contract = undefined; currentCase = undefined; ready(); status("Invalid contract address."); }
};

async function readState() {
  if (!contract) throw Error("Configure a contract first.");
  currentCase = await contract.get_case();
  const plain = {
    state: currentCase.state, proposer: currentCase.proposer, co_signer: currentCase.co_signer,
    draft: currentCase.draft, counter: currentCase.counter, outcome: currentCase.outcome,
    result: currentCase.result, revision: Number(currentCase.revision), attempts: Number(currentCase.attempts)
  };
  ready();
  status(JSON.stringify(plain, null, 2));
  return plain;
}

async function write(method, args = []) {
  if (!contract || !signer) throw Error("Connect a wallet and configure the contract first.");
  status(`Awaiting wallet signature for ${method}…`);
  const tx = await contract[method](...args);
  status(`Submitted ${tx.hash}\nAwaiting finality and authoritative readback…`);
  const receipt = await tx.wait();
  if (!receipt) throw Error("Receipt was not finalized.");
  status(`FINALIZED ${tx.hash}\nReading authoritative state…`);
  await readState();
}

$("create").onclick = async () => {
  try {
    const draft = $("draft").value.trim(), coSigner = $("cosigner").value.trim(), nonce = $("nonce").value.trim();
    if (!draft || !isAddress(coSigner) || !nonce) throw Error("Draft, co-signer and nonce are required.");
    await write("create_case", [draft, coSigner, nonce]);
  } catch (error) { status(error.shortMessage || error.message); }
};
$("counterAction").onclick = async () => {
  try { const text = $("counter").value.trim(); if (!text) throw Error("Counter text is required."); await write("counter", [text]); }
  catch (error) { status(error.shortMessage || error.message); }
};
$("freeze").onclick = async () => { try { await write("freeze"); } catch (error) { status(error.shortMessage || error.message); } };
$("evaluate").onclick = async () => { try { await write("evaluate"); } catch (error) { status(error.shortMessage || error.message); } };
$("retry").onclick = async () => { try { await write("retry"); } catch (error) { status(error.shortMessage || error.message); } };
$("read").onclick = async () => { try { await readState(); } catch (error) { status(error.shortMessage || error.message); } };
void RPC;
