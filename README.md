# web3-claim-contract

Dual-path token claim: Merkle tree for fixed allocations + EIP-712 signature for
on-the-fly whitelisting. **Externally audited** - reports in `_docs/`.

## Overview

Token claim contract used in the MagicSquare SQR ecosystem. Supports two independent
claim paths that can be active simultaneously:

- **Merkle path** - allocations are committed in a Merkle root at snapshot time.
  Gas-efficient for large, pre-determined allocation lists.
- **Signature path** - the backend signs a per-wallet claim off-chain using EIP-712
  typed data. Wallets can be added after the snapshot without touching the contract.

Both paths write to the same "claimed" bitmap to prevent double-claims across paths.

## Architecture

```
WEB3Claim.sol (OpenZeppelin Upgradeable)
  claimMerkle(amount, proof)    <- verifies MerkleProof.verify()
  claimSignature(amount, sig)   <- verifies EIP-712 typed-data signature
  claimed[wallet]               <- shared bitmap, set on first claim either path
  owner: setMerkleRoot()        <- update root without redeploying
  owner: setSigner()            <- rotate the off-chain signer key
```

Audit reports (PDF): `_docs/`

## Key decisions

**Why both Merkle AND signature paths?** The Merkle root captures the allocation
snapshot. But if a wallet is missed, re-rooting the tree and upgrading the contract
is expensive and risky. The signature path lets the backend issue a valid claim to
any wallet at any time without touching on-chain state. Production allocation added
~3% late claims via the signature path after TGE.

**Shared claimed bitmap:** both paths write to the same mapping so a wallet that
claims via Merkle cannot re-claim via signature and vice versa. The bitmap is keyed
by wallet address, not by path.

## Setup & run

```bash
yarn install
yarn clean
yarn test
```

Copy `.env.example` to `.env` before running deploy scripts.

## Test coverage

```bash
yarn coverage
```

Audited contracts target 100% branch coverage. Check `coverage/index.html` after
running for a full per-function breakdown.

## License

MIT
