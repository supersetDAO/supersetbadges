import { useState } from "react";

export const UseIPFSPin = () => {
  const [successImg, setSuccessImg] = useState(false);
  const [inProgressImg, setInProgressImg] = useState(false);
  const [failImg, setFailImg] = useState(false);
  const [imgHash, setImgHash] = useState("");

  // Pinata
  const Pinata = require("@pinata/sdk");
  const _ApiKey = process.env.PINATA_API_KEY;
  const _SecrectApi = process.env.PINATA_SECRET_KEY;

  // post and get imports
  const axios = require("axios");
  let FormData = require("form-data");

  // this function pins an image to IPFS
  // imgHash is the returned IPFS hash
  const pinFileToIPFS = async (imgFile: File) => {
    let imageHash: string;

    const data = new FormData();
    data.append("file", imgFile);
    const _url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    setInProgressImg(true);
    await axios
      .post(_url, data, {
        headers: {
          pinata_api_key: _ApiKey,
          pinata_secret_api_key: _SecrectApi,
        },
      })
      .then(function (response: any) {
        console.log("response - line 120", response);
        imageHash = response.data.IpfsHash;
        setImgHash(imageHash);
        setInProgressImg(false);
        setSuccessImg(true);
      })
      .catch(function (err: any) {
        console.log(err);
        setInProgressImg(false);
        setFailImg(true);
      });
  };
  return { pinFileToIPFS, inProgressImg, failImg, successImg, imgHash };
};
