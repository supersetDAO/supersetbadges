import { BigInt, Bytes, Address, ByteArray } from "@graphprotocol/graph-ts";
// import { listeners } from "process";
import {
	RoleUpdated,
	MetadataUpdated,
	Transfer
} from "../generated/SupersetBadges/SupersetBadges";
import { User, Badge } from "../generated/schema";

// export function handleSetPurpose(event: SetPurpose): void {
//   let senderString = event.params.sender.toHexString();

//   let sender = Sender.load(senderString);

//   if (sender === null) {
//     sender = new Sender(senderString);
//     sender.address = event.params.sender;
//     sender.createdAt = event.block.timestamp;
//     sender.purposeCount = BigInt.fromI32(1);
//   } else {
//     sender.purposeCount = sender.purposeCount.plus(BigInt.fromI32(1));
//   }

//   let purpose = new Purpose(
//     event.transaction.hash.toHex() + "-" + event.logIndex.toString()
//   );

//   purpose.purpose = event.params.purpose;
//   purpose.sender = senderString;
//   purpose.createdAt = event.block.timestamp;
//   purpose.transactionHash = event.transaction.hash.toHex();

//   purpose.save();
//   sender.save();
// }

let ZERO_ADDRESS_STRING = "0x0000000000000000000000000000000000000000";

let ZERO_ADDRESS: Bytes = Bytes.fromHexString(ZERO_ADDRESS_STRING) as Bytes;
let ZERO = BigInt.fromI32(0);
let ONE = BigInt.fromI32(1);
let TWO = BigInt.fromI32(2);
let THREE = BigInt.fromI32(3);

export function handleRoleUpdated(event: RoleUpdated): void {
	let address = event.params.user.toHexString();
	// let role = BigInt.fromI32(event.params.roleType);
	let role = BigInt.fromI32(event.params.roleType).toString();
	let timestamp = event.block.timestamp;
	let thisUser = User.load(address);
	if (thisUser == null) {
		thisUser = new User(address);
		// create new User
		thisUser.initialized = timestamp;
	}
	thisUser.role = role;
	// switch (role) {
	//   case ZERO.toString() :
	//     thisUser.role = 'None';
	//     break;
	//   case ONE.toString() :
	//     thisUser.role = 'Member';
	//     break;
	//   case TWO.toString() :
	//     thisUser.role = 'Issuer';
	//     break;
	//   case THREE.toString() :
	//     thisUser.role = 'Owner';
	//     break;
	//   default:
	//     thisUser.role = 'None';
	// }
	// thisUser.role = 'Member';
	thisUser.save();
}

export function handleMetadataUpdated(event: MetadataUpdated): void {
	let tokenId = event.params.tokenId.toString();
	let uri = event.params.data.toString();
	let timestamp = event.block.timestamp;
	let thisBadge = Badge.load(tokenId);
	if (thisBadge == null) {
		// this code is to satisfy the compiler
		// in practice, badges should never be created here
		// the Transfer event and handler should always fire first
		thisBadge = new Badge(tokenId);
	}
	thisBadge.uri = uri;
	thisBadge.save();
}

export function handleTransfer(event: Transfer): void {
	//event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
	let firer = event.transaction.from.toHexString();
	let from = event.params.from.toHexString();
	let to = event.params.to.toHexString();
	let tokenId = event.params.tokenId.toString();
	let timestamp = event.block.timestamp;

	let thisBadge = Badge.load(tokenId);
	if (thisBadge == null) {
		thisBadge = new Badge(tokenId);
		// create new Badge
		thisBadge.owner = to;
		thisBadge.issuedTo = to;
		thisBadge.issueDate = timestamp;
		thisBadge.burned = false;
		thisBadge.uri = "";
		thisBadge.burnDate = ZERO;
		thisBadge.burnedBy = "0";
	}

	if (to == ZERO_ADDRESS_STRING) {
		// badge is burnt
		thisBadge.owner = to;
		thisBadge.burned = true;
		thisBadge.burnDate = timestamp;
		thisBadge.burnedBy = firer;
	}
	thisBadge.save();
}
