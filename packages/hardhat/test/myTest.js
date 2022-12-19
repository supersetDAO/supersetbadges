/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const { ethers } = require("hardhat");
const { expect } = require("chai");
// const {
// 	SupersetBadges
// } = require("../../subgraph/generated/SupersetBadges/SupersetBadges");

describe("Superset Badges", function () {
	let Superset;

	// quick fix to let gas reporter fetch data from gas station & coinmarketcap
	// before((done) => {
	//   setTimeout(done, 2000);
	// });

	let owner; // admin privledges
	let owner2;
	let account1;
	let account2;
	let account3;
	let account4;
	let account5;
	let account6;
	// admins
	let account7;
	let account8;
	let account9;

	let user1;
	let user2;
	let user3;
	let user4;
	let user5;
	let user6;
	// admins
	let user7;
	let user8;
	let user9;

	let owner2Call;

	before(async () => {
		const signers = await ethers.getSigners();
		owner = signers[0].address;
		owner2 = signers[10].address;
		account1 = signers[1].address;
		account2 = signers[2].address;
		account3 = signers[3].address;
		account4 = signers[4].address;
		account5 = signers[5].address;
		account6 = signers[6].address;
		account7 = signers[7].address;
		account8 = signers[8].address;
		account9 = signers[9].address;

		const YourContract = await ethers.getContractFactory("SupersetBadges");

		SupersetBadges = await YourContract.deploy(
			"SupersetBadges",
			"SupersetBadges",
			owner
		);

		await SupersetBadges.deployed();

		user1 = SupersetBadges.connect(signers[1]);
		user2 = SupersetBadges.connect(signers[2]);
		user3 = SupersetBadges.connect(signers[3]);
		user4 = SupersetBadges.connect(signers[4]);
		user5 = SupersetBadges.connect(signers[5]);
		user6 = SupersetBadges.connect(signers[6]);
		user7 = SupersetBadges.connect(signers[7]);
		user8 = SupersetBadges.connect(signers[8]);
		user9 = SupersetBadges.connect(signers[9]);

		owner2Call = SupersetBadges.connect(signers[10]);
	});

	describe("SupersetBadges", function () {
		it("Should have deployed with the root owner address", async function () {
			expect(await SupersetBadges.checkRole(owner)).to.equal(4);
		});

		describe("addMembers()", function () {
			it("Should add an array of members, and mint badges for each", async function () {
				await SupersetBadges.addMembers(
					[account1, account2, account3],
					["test1", "test2", "test3"]
				);
				expect(await SupersetBadges.checkRole(account1)).to.equal(1);
				expect(await SupersetBadges.checkRole(account2)).to.equal(1);
				expect(await SupersetBadges.checkRole(account3)).to.equal(1);
				expect(await SupersetBadges.checkURI(1)).to.equal("test1");
				expect(await SupersetBadges.checkURI(2)).to.equal("test2");
				expect(await SupersetBadges.checkURI(3)).to.equal("test3");
			});
			it("Should prevent existing members from being added again", async function () {
				expect(
					SupersetBadges.addMembers(
						[account1, account2, account3],
						["test1", "test2", "test3"]
					)
				).to.be.reverted;
			});
		});

		describe("updateURI()", function () {
			it("Should successfully update the URI for a given token", async function () {
				await SupersetBadges.updateURI(1, "newURI");
				expect(await SupersetBadges.checkURI(1)).to.equal("newURI");
			});
		});

		describe("batchUpdateURI()", function () {
			it("Should successfully update multiple URIs for given tokenIds", async function () {
				await SupersetBadges.batchUpdateURI(
					[1, 2, 3],
					["batchSuccess1", "batchSuccess2", "batchSuccess3"]
				);
				expect(await SupersetBadges.checkURI(1)).to.equal("batchSuccess1");
				expect(await SupersetBadges.checkURI(2)).to.equal("batchSuccess2");
				expect(await SupersetBadges.checkURI(3)).to.equal("batchSuccess3");
			});
		});

		describe("revokeMembers()", function () {
			it("Should revoke an array of members, and burn their badges", async function () {
				await SupersetBadges.revokeMembers([account1, account2, account3]);
				expect(await SupersetBadges.checkRole(account1)).to.equal(0);
				expect(await SupersetBadges.checkRole(account2)).to.equal(0);
				expect(await SupersetBadges.checkRole(account3)).to.equal(0);
			});
		});

		describe("addIssuers()", function () {
			it("Should add an array of new issuers.", async function () {
				await SupersetBadges.addIssuers([account1, account2, account3]);
				expect(await SupersetBadges.checkRole(account1)).to.equal(2);
				expect(await SupersetBadges.checkRole(account2)).to.equal(2);
				expect(await SupersetBadges.checkRole(account3)).to.equal(2);
			});
			it("Should revert when active issuers are attempted to be added as members.", async function () {
				expect(SupersetBadges.addMembers([account1], ["test1"])).to.be.reverted;
				expect(SupersetBadges.addMembers([account2], ["test2"])).to.be.reverted;
				expect(SupersetBadges.addMembers([account3], ["test3"])).to.be.reverted;
			});
			it("Should allow issuers to add new members.", async function () {
				await user1.addMembers(
					[account4, account5, account6],
					["test4", "test5", "test6"]
				);
				expect(await SupersetBadges.checkRole(account4)).to.equal(1);
				expect(await SupersetBadges.checkRole(account5)).to.equal(1);
				expect(await SupersetBadges.checkRole(account6)).to.equal(1);
			});
		});

		describe("addAdmins()", function () {
			it("Should add new admins", async function () {
				await SupersetBadges.addAdmins([account7, account8, account9]);
				expect(await SupersetBadges.checkRole(account7)).to.equal(3);
				expect(await SupersetBadges.checkRole(account8)).to.equal(3);
				expect(await SupersetBadges.checkRole(account9)).to.equal(3);
			});
		});

		describe("revokeIssuers()", function () {
			it("Should allow admins to revoke issuers.", async function () {
				await user7.revokeIssuers([account1, account2, account3]);
				expect(await SupersetBadges.checkRole(account1)).to.equal(0);
				expect(await SupersetBadges.checkRole(account2)).to.equal(0);
				expect(await SupersetBadges.checkRole(account3)).to.equal(0);
			});
		});

		describe("revokeAdmins()", function () {
			it("Should allow admins to revoke admins.", async function () {
				await user7.revokeAdmins([account7, account8, account9]);
				expect(await SupersetBadges.checkRole(account7)).to.equal(0);
				expect(await SupersetBadges.checkRole(account8)).to.equal(0);
				expect(await SupersetBadges.checkRole(account9)).to.equal(0);
			});
		});

		describe("transferFrom() & safeTransferFrom()", function () {
			it("Should not allow badge holders to transfer their badges", async function () {
				expect(await SupersetBadges.ownerOf(4)).to.equal(account4);
				expect(user4.transferFrom(account4, owner, 4)).to.be.reverted;
				expect(
					user4["safeTransferFrom(address,address,uint256)"](account4, owner, 4)
				).to.be.reverted;
				expect(
					user4["safeTransferFrom(address,address,uint256,bytes)"](
						account4,
						owner,
						4,
						0
					)
				).to.be.reverted;
			});
		});

		describe("transferOwner()", function () {
			it("Should initiate an owernship transfer", async function () {
				await SupersetBadges.initiateTransfer(owner2);
				expect(await SupersetBadges.transferAddress()).to.equal(owner2);
			});
			it("Should fail to complete transfer before 3 days time", async function () {
				expect(owner2Call.transferOwner(true)).to.be.reverted;
			});
			it("Should revoke a pending transfer successfully", async function () {
				await SupersetBadges.stopTransfer();
				expect(await SupersetBadges.transferTimer()).to.equal(0);
			});
			it("Should fail to transfer after waiting past the waiting period and revoking before being called by the pending new Owner", async function () {
				await SupersetBadges.initiateTransfer(owner2);
				await ethers.provider.send("evm_increaseTime", [259201]);
				await SupersetBadges.stopTransfer();
				expect(owner2Call.transferOwner(true)).to.be.reverted;
			});
			it("Should succeed without transferring ownership if false is provided", async function () {
				await SupersetBadges.initiateTransfer(owner2);
				await ethers.provider.send("evm_increaseTime", [259201]);
				await owner2Call.transferOwner(false);
				expect(await SupersetBadges.checkRole(owner)).to.equal(4);
				expect(await SupersetBadges.checkRole(owner2)).to.equal(0);
			});
			it("Should successfully transfer ownership after the waiting period without a revocation", async function () {
				await SupersetBadges.initiateTransfer(owner2);
				await ethers.provider.send("evm_increaseTime", [259201]);
				await owner2Call.transferOwner(true);
				expect(await SupersetBadges.checkRole(owner)).to.equal(0);
				expect(await SupersetBadges.checkRole(owner2)).to.equal(4);
			});
			it("Should prevent sending to an existing role holder", async function () {
				expect(owner2Call.initiateTransfer(account3)).to.be.reverted;
				expect(owner2Call.initiateTransfer(account4)).to.be.reverted;
			});
		});

		describe("revokeSelf()", function () {
			it("Should allow a valid member to revoke their own membership", async function () {
				expect(await SupersetBadges.checkRole(account4)).to.equal(1);
				await user4.revokeSelf();
				expect(await SupersetBadges.checkRole(account4)).to.equal(0);
			});
		});
	});

	// describe("something", function () {
	//   it("should do something", async function () {

	//   })
	// });

	// describe("setPurpose()", function () {
	//   it("Should be able to set a new purpose", async function () {
	//     const newPurpose = "Test Purpose";

	//     await SupersetBadges.setPurpose(newPurpose);
	//     expect(await SupersetBadges.purpose()).to.equal(newPurpose);
	//   });

	//   it("Should emit a SetPurpose event ", async function () {
	//     const [owner] = await ethers.getSigners();

	//     const newPurpose = "Another Test Purpose";

	//     expect(await SupersetBadges.setPurpose(newPurpose))
	//       .to.emit(SupersetBadges, "SetPurpose")
	//       .withArgs(owner.address, newPurpose);
	//   });
	// });
});
