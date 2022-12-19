# 💠 Superset Membership Contract

Includes contract, subgraph, and front end.

🔏 Smart contract `SupersetBadges.sol` in `packages/hardhat/contracts`

📝 Edit frontend `App.jsx` in `packages/react-app/src`

💼 Edit your subgraph scripts in `packages/subgraph/src`

📱 Open http://localhost:3000 to see the app using `yarn start`

## 🧠 Overview

This repo contains a full MVP for deployment and web portal access to SupersetBadges.

SupersetBadges, defined in `packages/hardhat/contracts/SupersetBadges.sol`, is an ERC-721 contract with transferability strictly gatekept. This allows for:

- Soulbound token functionality
- OpenSea & other standard web3 UI recognition
- Custom role hierarchy and metadata mutation

The only 'transfers' allowed are minting and burning transactions, which themselves are gatekept by access to the Role system.

## 👨‍⚖️ Role System

Uses a custom role system for modular permissions which fall outside the expressivity of OpenZeppelin's 'Ownable' template. Roles are defined by the enum `Role` in `packages/hardhat/contracts/SupersetBadges.sol`.

`enum Role {`

` None`

` Member`

` Issuer`

` Admin`

` Owner`

`}`

Roles are mutually exclusive, meaning that no address can occupy more than a single role at one time. Here is a brief description of the four roles, intended usecases, and specially permissioned functions.

### 🚫 None

Default value and placeholder for an address without any of the other active roles. Does not grant any special permissions.

### 🧑‍💻 Member

Designates a current Superset Badge owning `Member`, with their own ERC-721 badge minted to their account.

This is the only role that can call the `revokeSelf()` function.

### 👷 Issuer

Designates an `Issuer` account, which can add new `Members`. Restricted in scope to allow for the automation of adding `Members`.

Can call the `addMembers(address[],string[])` function.

### 🦸 Admin

Designates an `Admin` account, which has additional functionalities intended to be operated trustees within the Superset team.

In addition to calling `Issuer` functions, can also call `addIssuers(address[])`, `revokeMembers(address[])`, `revokeIssuers(address[])`, `revokeAdmins(address[])`, `updateURI(uint256,string)`, and `batchUpdateURI(uint256[],string[])`.

### 🧙 Owner

Designates the single `Owner` account, which will be operated by a gnosis safe maintained by Superset trustees.

The initial `Owner` role is defined upon contract deployment.

Guide for building transactions from a gnosis safe: [Building Gnosis Safe Transactions](https://help.gnosis-safe.io/en/articles/3738081-contract-interactions)

In addition to calling `Admin` functions, can also call `addAdmins(address[])`, `initiateTransfer(address)` and `stopTransfer()`.

## Ownership Transferring

Transferring the `Owner` role from one account to another is implemented as a two step process to prevent accidental contract lockup by granting this role to an incorrect address.

The process uses the functions `initiateTransfer(address)`, `stopTransfer()` and `transferOwner(bool)` in the following manner:

1. `initiateTransfer(address)` is called by the current `Owner`, with an input of the `transferAddress`, which is the address to which the owner role is intended to be transferred. The `transferAddress` must not occupy any current role, and cannot be added to any other role unless the process is revoked. This starts a 3 day timer.

2. At any time after `initiateTransfer(address)` is called, the current `Owner` account may call `stopTransfer()`, which cancels the current pending transfer and resets all relevant variables. If `stopTransfer()` is called, the `transferAddress` is then freed to be added into other roles. `stopTransfer()` will cancel a pending transfer process after the 3 day window if called before a successful `transferOwner(bool)` call.

3. After the three day waiting period, `transferOwner(bool)` may be called by the `transferAddress`. The boolean input resolves wether the `transferAddress` wishes to accept this new role or not - `true` will resolve the transfer as successful, stripping the current `Owner` address of its role and granting this role to the `transferAddress`. If `false` is given, it will not transfer the `Owner` role, but will reset the transfer process as if `stopTransfer()` had been called.

## 🏗 IPFS Builder

`packages/react-app/src/IPFS`

Contains useful components for pinning and retreiving information from IPFS. These are formatted as mutable hooks to be inherited at other components, or changed as needed (for example, changing the metadata JSON structure or switching IPFS gateways).

This is built expecting the use of a [Pinata](https://pinata.cloud) account, for which specific secret keys are required for access to one's personal pinning gateway.

There are two environment variables which may need to be configured depending on the method of front end hosting. These are in the code within the following files as:

`process.env.PINATA_API_KEY`
`process.env.PINATA_SECRET_KEY`

### `/BuildJSON.ts`

Returns JSON object template to be stored on IPFS. The currently implemented fields `description`, `external_url`, `image`, and `name` are formatted to OpenSea metadata standards, although the addition of other fields is possible.

In the current build, every image is the same and is hardcoded in this file - however, this can be changed to a dynamic input if needed.

### `/PinImage.ts`

Pins an image to IPFS. If every image reference is the same, then this function is not necessary to call every time a new badge is created. Can also be used to store other file types if needed.

`_ApiKey` and `_SecretApi` should be environment variables for your Pinata account.

### `/PinJSON.ts`

Pins a JSON object to IPFS. Calls `buildJSON` on \***\*line 27\*\*** to create an object unique to the member's address. This flow can be easily mutated, for example also taking an image hash from `pinFileToIPFS` and building a JSON containing a specific IPFS image url.

`_ApiKey` and `_SecretApi` should be environment variables for your Pinata account.

## 📚 Scaffold-Eth

This repo is built using a scaffold-eth template. This provides many useful tools, for example automatically building compiled contracts in the hardhat repo into ABIs ready for use in the subgraph and react-app repos. For useful commands and other resources for using scaffold-eth, look here: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)

For deploying contracts to a mainnet or testnet, update environment variables in the `packages/hardhat/hardhat.config.js` for the desired network.

Instructions for local deployment, which includes a local blockchain to deploy contracts and run transactions, deploying a local subgraph on a Docker instance, and booting the front end are in `how2boot.md`. Note that the local front end will be reading and writing to the contracts defined in its build.
