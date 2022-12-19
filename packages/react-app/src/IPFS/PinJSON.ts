import { useState } from "react";
import { BuildJSON } from "./BuildJSON";

export const UseIPFSPin = () => {
  const [successJSON, setSuccessJSON] = useState(false);
  const [inProgressJSON, setInProgressJSON] = useState(false);
  const [metadataHash, setMetadataHash] = useState("");
  const [failJSON, setFailJSON] = useState(false);

  const { buildJSON } = BuildJSON();

  // Pinata
  const Pinata = require("@pinata/sdk");
  const _ApiKey = process.env.PINATA_API_KEY;
  const _SecrectApi = process.env.PINATA_SECRET_KEY;
  // const pinata = Pinata(_ApiKey, _SecrectApi);

  // post and get imports
  const axios = require("axios");
  let FormData = require("form-data");
  let returnHash: string;

  // Pins JSON to IPFS
  const pinJSONToIPFS = async (address: String) => {
    const metadataObject = buildJSON(address);

    console.log(metadataObject, "metadata");

    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    // add to ipfs/pinata
    await axios
      .post(url, metadataObject, {
        headers: {
          pinata_api_key: _ApiKey,
          pinata_secret_api_key: _SecrectApi,
        },
      })
      .then(async function (response: any) {
        console.log("response - line 144", response.data.IpfsHash);
        returnHash = response.data.IpfsHash;
        setMetadataHash(returnHash);
        setInProgressJSON(false);
        setSuccessJSON(true);
        return returnHash;
      })
      .catch(function (err: any) {
        console.log("some error occurred with IPFS / Pinata pinning", err);
        setInProgressJSON(false);
        setFailJSON(true);
        return "caught";
      });
    return returnHash;
  };
  return { pinJSONToIPFS, inProgressJSON, failJSON, successJSON, metadataHash };
};
