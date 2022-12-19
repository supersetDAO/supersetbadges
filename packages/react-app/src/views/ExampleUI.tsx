import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import { UseIPFSPin } from "../IPFS/PinJSON";
import { ethers } from "ethers";

import { Address, Balance, Events } from "../components";

export default function ExampleUI(props: any) {
  // steps
  // take user inputs
  // array of addresses, information for each JSON object
  // builds JSON for each address
  // uses same image for each one

  const { pinJSONToIPFS, inProgressJSON, failJSON, successJSON, metadataHash } = UseIPFSPin();
  const [hashes, setHashes] = useState<String[]>([]);
  const [inputBox, setInputBox] = useState("");

  // useEffect(() => {
  //   metadataHash.length > 0 ? setHashes([...hashes, metadataHash]) : null;
  // }, [metadataHash]);

  const pinAndFireTX = async () => {
    let tempArr: String[] = [];
    console.log("INPUTS: ", inputBox);
    const newMembers = inputBox.split(" ");
    let addressCheck = true;
    if (newMembers.length > 0) {
      newMembers.map(member => {
        addressCheck = ethers.utils.isAddress(member.toString());
      });
    }
    if (newMembers.length > 0 && addressCheck) {
      let failCheck = false;
      newMembers.map(member => {
        tempArr.push("");
      });
      const p = newMembers.map(async (member, i) => {
        let w = await pinJSONToIPFS(member);
        console.log(w, "checkw");
        if (w == "caught") {
          failCheck = true;
        }
        tempArr[i] = w;
      });
      await Promise.all(p);
      setHashes(tempArr);
      console.log("CHECKPOINT");
      console.log(inputBox);
      console.log(hashes);
      console.log(newMembers);
      console.log(newMembers.length, " + ", hashes.length, " + ", tempArr.length);
      if (failCheck) {
        console.log("Pinning failed, please format input and try again.");
      } else {
        // try firing tx
        console.log("associated hashes");
        newMembers.map((member, i) => {
          console.log(member, " ", tempArr[i]);
        });
        let tx = await props.writeContracts.SupersetBadges.addMembers(newMembers, tempArr);
      }
    }
  };
  console.log(props.writeContracts, "PROPS");

  return (
    <div
      style={{ display: "flex", flexDirection: "column", textAlign: "left", marginLeft: "15px", marginRight: "15px" }}
    >
      <br />
      <div>
        This calls the addMembers() function, creating and pinning formed IPFS objects for each user, and then minting
        tokens with the hash of the JSON stored in their URI field
      </div>
      <br />
      <div>Please strictly format the input as addresses separated a single space, ex.</div>
      <div>0x34cD... 0xjAu... 0x8Db3</div>
      <form>
        <label>
          Addresses:{" "}
          <textarea
            onChange={e => setInputBox(e.target.value)}
            style={{ backgroundColor: "lightgray", width: "400px", height: "200px", color: "black" }}
            name="name"
          />
        </label>
        {/* <input style={{ backgroundColor: "black" }} type="text" value="Type" /> */}
      </form>
      <button style={{ backgroundColor: "salmon", color: "black" }} onClick={() => pinAndFireTX()}>
        Add Members
      </button>
    </div>
  );
}
