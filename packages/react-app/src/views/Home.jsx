/* eslint-disable no-unused-expressions */
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import GraphiQL from "graphiql";
import fetch from "isomorphic-fetch";
import CsvDownloadButton from "react-json-to-csv";
import _ from "lodash";
var axios = require("axios");

var config = {
  method: "get",
  url: "https://gateway.pinata.cloud/ipfs/QmNjmzjuMNQ1g5c4T5r427vPTfUYXsN8QS1KxFf8Pr2GAZ",
  // headers: {
  //   'Authorization': 'Bearer PINATA JWT'
  // }
};

const configGen = uri => {
  return {
    method: "get",
    url: `https://gateway.pinata.cloud/ipfs/${uri}`,
  };
};

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home() {
  const EXAMPLE_GRAPHQL = `
  {
    users {
      id
      role
      initialized
      badges {
        id
        owner
        issuedTo {
          id
        }
        uri
        issueDate
        burned
        burnDate
      }
    }
    badges {
      id
        owner
        issuedTo {
          id
        }
        uri
        issueDate
        burned
        burnDate
    }
  }  
  `;
  const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL);
  const { loading, data } = useQuery(EXAMPLE_GQL, { pollInterval: 2500 });

  useEffect(() => {
    console.log("data ", data);
  }, [data]);

  // return !loading ? <div>{JSON.stringify(data)}</div> : <div>Loading...</div>;

  const [owner, setOwner] = useState(null);
  const [admins, setAdmins] = useState(null);
  const [issuers, setIssuers] = useState(null);
  const [members, setMembers] = useState(null);
  const [badges, setBadges] = useState(null);
  const [ipfs, setIpfs] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [membersData, setMembersData] = useState(null);

  // determines active user roles
  useEffect(() => {
    console.log(data, "DATA EFFECT");
    if (data) {
      let tempOwner = _.filter(data.users, function (o) {
        return o.role == "4";
      });
      setOwner(tempOwner[0].id);
      let tempAdmins = _.filter(data.users, function (o) {
        return o.role == "3";
      });
      tempAdmins ? setAdmins(tempAdmins) : null;
      let tempIssuers = _.filter(data.users, function (o) {
        return o.role == "2";
      });
      tempIssuers ? setIssuers(tempIssuers) : null;
      let tempMembers = _.filter(data.users, function (o) {
        return o.role == "1";
      });
      tempMembers ? setMembers(tempMembers) : null;
      setBadges(data.badges);
      let tempCSV = [];
      data.users.map((user, i) => {
        if (user.role != "0") {
          let tempObj = {
            id: user.id,
            role: user.role,
            initialized: user.initialized,
            badgeId:
              user.role == "1"
                ? _.filter(user.badges, function (o) {
                    return o.burned == false;
                  })[0].id
                : "",
          };
          tempCSV.push(tempObj);
        }
      });
      setMembersData(tempCSV);
    }
  }, [data]);

  // builds ipfs object for csv download
  useEffect(() => {
    async function doit() {
      let tempArr = [];
      if (badges && badges.length > 0) {
        badges.map(badge => {
          tempArr.push({});
        });
        const p = badges.map(async (badge, i) => {
          console.log("BADGE LOOP ORDER ", badge.id);
          console.log("BADGE LOOP URI ", badge.uri);
          if (badge.uri.length === 46) {
            await axios(configGen(badge.uri)).then(res => {
              console.log("RES ", res);
              console.log(badge.id);
              if ((res.status = 200)) {
                tempArr[i] = res.data;
              } else {
                tempArr[i] = { name: "ERROR" };
              }
            });
          } else {
            tempArr[i] = { name: "ERROR" };
          }
        });
        await Promise.all(p);
        setIpfs(tempArr);
        console.log("check Arrays");
        console.log(ipfs, badges);
      }
    }
    doit();
  }, [badges]);

  // builds CSV data for badges
  useEffect(() => {
    if (ipfs && badges && ipfs.length == badges.length && ipfs.length > 0) {
      let newArr = [];
      ipfs.map((item, i) => {
        newArr.push({ ...item });
        newArr[i].badgeId = badges[i].id;
        newArr[i].issuedTo = badges[i].issuedTo.id;
        newArr[i].uri = badges[i].uri;
        newArr[i].timestamp = badges[i].issueDate;
        newArr[i].burned = badges[i].burnDate;
        if (newArr[i].name == "ERROR") {
          newArr[i].description = "ERROR";
          newArr[i].external_url = "ERROR";
          newArr[i].image = "ERROR";
        }
      });
      setCsvData(newArr);
      console.log("NEWARR ", newArr);
    }
  }, [ipfs]);

  // const generateIPFS = async uri => {
  //   let res;
  //   if (uri.length === 46) {
  //     let p = await axios(configGen(uri));
  //     res = Promise.all(p);
  //   }
  //   return uri.length === 46 ? (
  //     <div>
  //       <div>{JSON.stringify(res)}</div>
  //     </div>
  //   ) : (
  //     <div>No valid IPFS hash found.</div>
  //   );
  // };

  return !loading ? (
    <div>
      <div
        className="UserContainer"
        style={{ display: "flex", flexDirection: "column", textAlign: "left", marginLeft: "10px" }}
      >
        {badges &&
        badges.length > 0 &&
        ipfs &&
        ipfs.length > 0 &&
        ipfs.length == badges.length &&
        membersData &&
        membersData.length > 1 ? (
          <span>
            <span>Member information: </span>
            <CsvDownloadButton
              data={membersData}
              filename={"supersetmembers.csv"}
              style={{ width: "150px", color: "black" }}
            />
          </span>
        ) : null}
        {badges && badges.length > 0 && ipfs && ipfs.length > 0 && ipfs.length == badges.length && csvData ? (
          <span>
            <span>Badge information: </span>
            <CsvDownloadButton
              data={csvData}
              filename={"supersetbadges.csv"}
              style={{ width: "150px", color: "black" }}
            />
          </span>
        ) : null}
        <div style={{ fontSize: "24px" }}>Users</div>
        <br />
        <div>Owner</div>
        <div>{owner}</div>
        <br />
        <div>Admins</div>
        {admins ? (
          admins.map(admin => {
            return <div>{admin.id}</div>;
          })
        ) : (
          <div>No Current Admins</div>
        )}
        <br />
        <div>Issuers</div>
        {issuers ? (
          issuers.map(issuer => {
            return <div>{issuer.id}</div>;
          })
        ) : (
          <div>No Current Issuers</div>
        )}
        <br />
        <div>Members</div>
        {members ? (
          members.map(member => {
            return (
              <div>
                {member.id}, badge_Id:{" "}
                {
                  _.filter(member.badges, function (o) {
                    return o.burned == false;
                  })[0].id
                }
              </div>
            );
          })
        ) : (
          <div>No current members.</div>
        )}
        <br />
        <div style={{ fontSize: "24px" }}>Badges</div>
        <br />
        {badges ? (
          badges.map((badge, i) => {
            return (
              <div>
                <div>Badge {badge.id}</div>
                <div>
                  Issued to {badge.issuedTo.id} at timestamp {badge.issueDate}
                </div>
                <div>URI: {badge.uri}</div>
                {ipfs && badges.length == ipfs.length ? (
                  ipfs[i].name == "ERROR" ? (
                    <div>Improperly formatted IPFS hash</div>
                  ) : (
                    <div>{JSON.stringify(ipfs[i])}</div>
                  )
                ) : null}
                {badge.burned ? <div style={{ color: "red" }}>BURNED at {badge.burnDate}</div> : null}
                <br />
              </div>
            );
          })
        ) : (
          <div>No members have been added to create a badge.</div>
        )}
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
}

export default Home;
