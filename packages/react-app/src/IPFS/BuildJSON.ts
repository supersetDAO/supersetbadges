import { useState } from "react";

export const BuildJSON = () => {
  // builds the JSON to be stored on IPFS for a particular object
  const buildJSON = (address: String) => {
    // build JSON
    //
    let badge: object = {
      description: `Superset membership badge for ${address}`,
      external_url: "https://supersetdao.com/membership",
      image:
        "https://png.pngtree.com/template/20191025/ourlarge/pngtree-futuristic-triangle-chain-logo-design-inspiration-image_323444.jpg",
      name: "Superset Member Badge",
    };

    return badge;
  };
  return { buildJSON };
};
