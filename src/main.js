import {BrowserProvider, Contract, getAddress, isAddress} from "ethers";
import "./style.css";
const RPC="https://studio-dev.genlayer.com/api", CHAIN=61997;
const ABI=["function create_case(string draft,string co_signer,string nonce)","function get_case() view returns (tuple(string state,string proposer,string co_signer,string draft,string counter,string outcome,string result,uint256 revision,uint256 attempts))"];
let provider, signer, contract;
const $=id=>document.getElementById(id), status=m=>$("status").textContent=m;
async function verifyNetwork(){const n=await provider.getNetwork();if(Number(n.chainId)!==CHAIN)throw Error(`Wrong network: ${n.chainId}. Switch to Studio Next (61997).`);$("network").textContent="Studio Next · 61997"}
function ready(){const ok=Boolean(contract);$("create").disabled=!ok;$("read").disabled=!ok}
$("connect").onclick=async()=>{try{if(!window.ethereum)throw Error("No injected wallet detected.");provider=new BrowserProvider(window.ethereum);await provider.send("eth_requestAccounts",[]);await verifyNetwork();signer=await provider.getSigner();$("wallet").textContent=(await signer.getAddress()).slice(0,10)+"…";ready();status("Wallet bound. Enter the deployed contract address.")}catch(e){status(e.message)}};
$("address").onchange=()=>{try{const a=getAddress($("address").value);contract=new Contract(a,ABI,signer||provider);ready();status("Contract configured. Writes remain pending until wallet signing.")}catch(e){contract=null;ready();status("Invalid contract address.")}};
$("create").onclick=async()=>{try{const draft=$("draft").value.trim(), co=$("cosigner").value.trim(), nonce=$("nonce").value.trim();if(!draft||!isAddress(co)||!nonce)throw Error("Draft, co-signer and nonce are required.");status("Awaiting wallet signature…");const tx=await contract.create_case(draft,co,nonce);status(`Submitted ${tx.hash}\nAwaiting finality and authoritative readback…`);const receipt=await tx.wait();if(!receipt)throw Error("Receipt not finalized.");status(`FINALIZED ${tx.hash}\nExecution receipt obtained. Reading authoritative state…`);await readState()}catch(e){status(e.shortMessage||e.message)}};
$("read").onclick=readState;async function readState(){try{if(!contract)throw Error("Configure contract first.");const state=await contract.get_case();status(JSON.stringify(state,null,2))}catch(e){status(e.shortMessage||e.message)}}
