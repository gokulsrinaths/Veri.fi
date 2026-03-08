# Creditcoin Testnet Integration — Audit Report

**Project:** Veri.fi (VeriAct)  
**Hackathon:** BUIDL CTC — Build for the Real World  
**Requirement:** Project must be deployed or interact with a blockchain testnet (Creditcoin testnet).  
**Audit date:** Based on current codebase.

---

## 1. Blockchain integration (codebase)

### 1.1 Findings

| Item | Location | Status |
|------|----------|--------|
| Chain ID | `apps/web/lib/creditcoin.ts`: `CREDITCOIN_CHAIN_ID = 102031` | Present |
| Chain ID | `apps/web/components/CreditcoinCheck.jsx`: `CREDITCOIN_CHAIN_ID = 102031` | Present |
| RPC URL | `apps/web/lib/creditcoin.ts`: `NEXT_PUBLIC_CREDITCOIN_RPC` default `https://rpc.testnet.creditcoin.network` | Present |
| RPC URL | `packages/contracts/hardhat.config.ts`: `creditcoinTestnet.url` same default | Present |
| Creditcoin references | README, protocol page, FeatureCards, ProofUploadCard, TaskForm, CreditcoinWallet, etc. | Present |
| ethers.js | `apps/web`: ethers v6 (BrowserProvider, Contract, formatEther, parseEther) | Present |
| viem | `apps/web/package.json`: viem dependency (wagmi-related) | Present |
| Smart contract usage | `apps/web/lib/creditcoin.ts` (createTask, verifyTask, getTask), `creditcoin-release-server.ts` (verifyTask server-side) | Present |
| Deployment script | `packages/contracts/scripts/deploy-veriact.ts` — deploys VeriActEscrow with verifier address | Present |

### 1.2 Contract interaction flow

- **Frontend (create task):** `TaskForm.tsx` → `createTaskOnChain()` in `lib/creditcoin.ts` → `connectWallet()` → `ensureCreditcoinNetwork()` → Contract `createTask({ value: rewardWei })`. Uses `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS` and `NEXT_PUBLIC_CREDITCOIN_RPC`.
- **Backend (settlement):** `app/api/submissions/route.ts` → `settleReward()` in `lib/contractService.ts` → `releaseOnChain()` in `lib/creditcoin-release-server.ts` → ethers `contract.verifyTask(onchainTaskId, workerAddress)`. Uses `VERIFIER_PRIVATE_KEY`, `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS`, `NEXT_PUBLIC_CREDITCOIN_RPC`.

---

## 2. Testnet configuration

### 2.1 Creditcoin testnet parameters (as used in codebase)

| Parameter | Expected (audit brief) | In codebase | Match |
|-----------|------------------------|-------------|--------|
| Chain ID | 102031 | 102031 (`creditcoin.ts`, `CreditcoinCheck.jsx`, `hardhat.config.ts`) | Yes |
| RPC | e.g. https://rpc.cc3-testnet.creditcoin.network | https://rpc.testnet.creditcoin.network (default everywhere) | Different URL; confirm with Creditcoin docs |
| Block explorer | https://creditcoin-testnet.blockscout.com | Not referenced in app (optional) | N/A |

The application is configured for **chain ID 102031** and **RPC https://rpc.testnet.creditcoin.network** consistently. If Creditcoin has moved to `rpc.cc3-testnet.creditcoin.network` for the same chain ID, set `NEXT_PUBLIC_CREDITCOIN_RPC` and `CREDITCOIN_RPC` to that URL.

### 2.2 Where configuration lives

- **Web app:** `apps/web/.env.example` — `NEXT_PUBLIC_CREDITCOIN_RPC`, `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS`, `VERIFIER_PRIVATE_KEY`.
- **Contracts:** `packages/contracts/hardhat.config.ts` — network `creditcoinTestnet` (chainId 102031, RPC from env or default).
- **Contracts env:** `packages/contracts/.env.example` — `PRIVATE_KEY`, `CREDITCOIN_RPC`, `VERIFIER_ADDRESS` / `DEPLOYER_ADDRESS`.

---

## 3. MetaMask / wallet integration

### 3.1 Findings

| Item | Location | Status |
|------|----------|--------|
| window.ethereum | `lib/creditcoin.ts` (connectWallet), `CreditcoinCheck.jsx`, `WalletContext.tsx` | Used |
| BrowserProvider | `apps/web/lib/creditcoin.ts`: `new BrowserProvider(window.ethereum)` | Used |
| eth_requestAccounts | `creditcoin.ts`: `provider.send("eth_requestAccounts", [])` | Used |
| wallet_switchEthereumChain | `creditcoin.ts`: `ensureCreditcoinNetwork()`; `CreditcoinCheck.jsx`: `switchToCreditcoinTestnet()` | Used |
| wallet_addEthereumChain | Both files when chain not added (code 4902) | Used |
| Chain params | chainId 0x18E0F (102031), chainName "Creditcoin Testnet", CTC, decimals 18 | Present |

The frontend correctly requests wallet connection via MetaMask (or any `window.ethereum` provider), switches to Creditcoin testnet (chain 102031), and adds the network if missing.

---

## 4. Contract address and usage

### 4.1 Environment variables

| Variable | Purpose | In .env.example |
|----------|----------|------------------|
| NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS | VeriActEscrow contract address | Yes (empty) |
| NEXT_PUBLIC_CREDITCOIN_RPC | RPC for Creditcoin testnet | Yes (default set) |
| VERIFIER_PRIVATE_KEY | Backend key that calls verifyTask | Yes (empty) |

No contract address is committed in the repo; it must be supplied via env after deployment.

### 4.2 Contract usage

- **Frontend:** Create task flow uses `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS` in `creditcoin.ts` for `createTask()`, `getTask()`, balance checks. If address is not set, `createTaskOnChain()` throws.
- **Backend:** `creditcoin-release-server.ts` and `contractService.ts` use the same address and `VERIFIER_PRIVATE_KEY` to call `verifyTask(onchainTaskId, workerAddress)` when a submission is verified. If address or key is missing, on-chain release is skipped and fallback settlement is used.

### 4.3 ABI and deployment

- VeriActEscrow ABI is inlined in `apps/web/lib/creditcoin.ts`, `apps/web/lib/creditcoin-release-server.ts`, and `apps/web/app/api/creditcoin/release/route.ts` (createTask, verifyTask, getTask, nextTaskId).
- Deployment: `packages/contracts/scripts/deploy-veriact.ts` — deploys VeriActEscrow to `creditcoinTestnet` with a verifier address. Prints the contract address for copying into `apps/web/.env.local`.

---

## 5. Settlement flow vs contract

- On verified submission, `contractService.settleReward()` is called with `onchainTaskId` and `participantAddress`.
- If both are set, it calls `releaseOnChain(onchainTaskId, participantAddress)` which sends a transaction to VeriActEscrow.verifyTask.
- If env is missing or the tx fails, fallback (mock) settlement is used and a mock tx hash can be returned.

So: **if the contract is deployed and env is set, the app does send real transactions to Creditcoin testnet for both create-task (escrow) and verify-task (payout).**

---

## 6. What is missing for “deployed on testnet”

The **codebase is correctly set up** for Creditcoin testnet. What is **not** in the repo:

1. **Deployed contract** — VeriActEscrow is not deployed by the repo; it must be deployed by the team.
2. **Contract address** — `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS` is empty in `.env.example`; no address in repo.
3. **Verifier key** — `VERIFIER_PRIVATE_KEY` is empty; without it, backend cannot call `verifyTask`.
4. **RPC** — Default is `https://rpc.testnet.creditcoin.network`. If the official testnet RPC is now `https://rpc.cc3-testnet.creditcoin.network`, env should be updated (and possibly docs).

Until the contract is deployed and the web app (and optionally backend) env are set, the project **runs in fallback mode** (no real escrow/payout on testnet).

---

## 7. Summary status

| Area | Status | Notes |
|------|--------|--------|
| Blockchain integration | **PASS** | ethers, contract calls, settlement flow implemented. |
| Testnet configuration | **PASS** | Chain ID 102031 and RPC configured; confirm RPC URL with Creditcoin if needed. |
| Contract deployment | **NOT DEPLOYED** | No deployed address in repo; deploy script exists and is correct. |
| MetaMask integration | **PASS** | Connect, switch chain, add chain, correct chain params. |

---

## 8. Final verdict

**NOT DEPLOYED TO TESTNET**

The application is **correctly configured** to run on Creditcoin testnet (chain 102031, RPC, wallet switch, contract integration, env vars). It is **not** yet “deployed on testnet” because:

- VeriActEscrow has not been deployed (no contract address in the repo).
- `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS` and `VERIFIER_PRIVATE_KEY` are not set in the app env.

After completing the steps in Section 9, the project will satisfy the hackathon requirement to be deployed or interact with Creditcoin testnet.

---

## 9. Step-by-step: Deploy to Creditcoin testnet

### 9.1 Prerequisites

- Node.js 18+
- pnpm (or npm)
- A wallet with testnet CTC for gas (Creditcoin testnet).
- Same wallet (or a dedicated one) to use as the verifier (backend) that will call `verifyTask`.

### 9.2 Deploy the contract

1. **Go to the contracts package**
   ```bash
   cd packages/contracts
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure env**
   - Copy `packages/contracts/.env.example` to `packages/contracts/.env`.
   - Set:
     - `PRIVATE_KEY` — deployer private key (must have testnet CTC).
     - `CREDITCOIN_RPC` or `CREDITCOIN_RPC_URL` — e.g. `https://rpc.testnet.creditcoin.network` (or `https://rpc.cc3-testnet.creditcoin.network` if that is the current testnet RPC).
     - `VERIFIER_ADDRESS` or `DEPLOYER_ADDRESS` — address allowed to call `verifyTask` (e.g. deployer for hackathon).

4. **Compile and deploy**
   ```bash
   pnpm run compile
   pnpm run deploy:veriact
   ```
   The script deploys to the `creditcoinTestnet` network (chainId 102031) and prints the contract address.

5. **Copy the printed address**  
   Example: `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS=0x...`

### 9.3 Configure the web app

1. **Open** `apps/web/.env.local` (create from `apps/web/.env.example` if needed).

2. **Set**
   - `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS=<address from step 9.2>`  
   - `NEXT_PUBLIC_CREDITCOIN_RPC=https://rpc.testnet.creditcoin.network` (or the correct testnet RPC).  
   - `VERIFIER_PRIVATE_KEY=0x...` — private key of the account that is `VERIFIER_ADDRESS` (so the backend can call `verifyTask`).

3. **Restart the web app**
   ```bash
   cd apps/web   # or from repo root: pnpm dev:web
   pnpm dev
   ```

### 9.4 Verify

1. Open the app, connect MetaMask, switch to Creditcoin testnet (chain 102031).
2. Create a task with a reward; confirm the createTask transaction on MetaMask and that the reward is escrowed.
3. Submit proof as another user; after verification, confirm the reward is released and the task closes.
4. Check the transaction hashes on the Creditcoin testnet block explorer (e.g. https://creditcoin-testnet.blockscout.com if applicable).

After this, the project is **deployed on and interacting with Creditcoin testnet** and meets the hackathon requirement.
