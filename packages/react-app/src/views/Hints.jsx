import { Select } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";

import { useTokenList } from "eth-hooks/dapps/dex";
import { Address, AddressInput } from "../components";

const { Option } = Select;

export default function Hints() {
  const item = (title, desc) => {
    return (
      <div>
        <div style={{ fontSize: "18px" }}>{title}</div>
        <div>{desc}</div>
        <br />
      </div>
    );
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", textAlign: "left", marginLeft: "10px", marginRight: "20px" }}
    >
      {item("addAdmins()", "Takes an array of addresses to create new Admins. Must be Owner to call.")}

      {item("addIssuers()", "Takes an array of addresses to create new Issuers. Must be Owner or Admin to call.")}
      {item(
        "addMembers()",
        "Takes an array of addresses and an array of strings (for the badge URI) to create new Members with issued badges. Must be Issuer or Admin or Owner to call.",
      )}
      {item("badgeCounter()", "For n number of total minted badges, including burnt badges, returns n+1.")}
      {item("balanceOf()", "Returns badge balance of a user. Should only ever return 0 (no active badge) or 1.")}
      {item("checkRole()", "Returns current role of user by address. 0:None. 1:Member. 2:Issuer. 3:Owner.")}
      {item("checkURI()", "For a given badgeId, returns the URI string. Will fail if the badge has been burnt.")}
      {item(
        "tokenURI()",
        "For a given badgeId, returns the URI string + baseURI - picked up by marketplace front ends. Will fail if the badge has been burnt.",
      )}
      {item("ownerOf()", "Current owner of a badge, by badgeId. Will fail for burnt tokens.")}
      {item(
        "revokeIssuers()",
        "Takes an array of addresses, and strips them of their issuer roles. Must be Admin or Owner to call.",
      )}
      {item(
        "revokeMembers()",
        "Takes an array of addresses, and strips them of their member roles, and burns that member's badge. Must be Admin or Owner to call.",
      )}
      {item(
        "revokeSelf()",
        "If the caller is a current member, strips caller of their member role and burns their badge.",
      )}
      {item(
        "transferOwner()",
        "Strips current owner of role, and grants it to the provided address. Must be Owner to call.",
      )}
      {item("updateURI()", "For a given badgeId, updates that badge's URI string. Must be Admin or Owner to call.")}
      {item(
        "batchUpdateURI()",
        "For a given array of badgeIds, updates that badge's URI string. Must be Admin or Owner to call.",
      )}
      {item(
        "transferFrom() & safeTransferFrom()",
        "Standard 721 functions for sending tokens - these should always revert when called.",
      )}
      {item("name() & symbol()", "Vanity strings for contract reference.")}
      {item(
        "approve() & isApprovedForAll() & isApproved() & setApprovalForAll()",
        "Standard 721 functions that have no explicit function here for users to call - should not in any way effect usability.",
      )}
      {item("supportsInterface()", "Standard 721 interface support for cross-contract calls.")}
    </div>
  );
}
