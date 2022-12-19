// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
	const signers = await hre.ethers.getSigners();
	const owner = signers[0].address;
	const account1 = signers[1].address;
	const account2 = signers[2].address;
	const account3 = signers[3].address;
	const account4 = signers[4].address;
	const account5 = signers[5].address;
	const account6 = signers[6].address;

	const badgeAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
	const badges = await hre.ethers.getContractAt("SupersetBadges", badgeAddress);

	await badges.addMembers(
		[account1, account2, account3, account4, account5, account6],
		["test1", "test2", "test3", "test4", "test5", "test6"]
	);

	await badges.revokeMembers([
		account1,
		account2,
		account3,
		account4,
		account5,
		account6
	]);

	await badges.addMembers(
		[account1, account2, account3],
		["test7", "test8", "test9"]
	);

	await badges.addIssuers([account4, account5, account6]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
