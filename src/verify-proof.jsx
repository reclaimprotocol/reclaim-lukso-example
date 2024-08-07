import { useState, useEffect } from "react";
import { writeContract } from "@wagmi/core";
import { abi } from "./abi";
import { config } from "./config";
import { Reclaim } from "@reclaimprotocol/js-sdk";

export default function VerifyProof(props) {
  const [proof, setProof] = useState({});
  const [verified, setVerified] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  useEffect(() => {
    const newProof = Reclaim.transformForOnchain(props.proof);
    setProof(newProof);
  }, []);

  return (
    <div>
      <button
        className="button"
        onClick={async () => {
          const hash = await writeContract(config, {
            abi: abi,
            address: "0x93a9d327836A5279E835EF3147ac1fb54FBd726B", //TODO : replace with your Reclaim contract's address
            functionName: "verifyProof",
            chainId: 4201, //TODO : replace with your chain id 4201 for Testnet 42 For Mainnet
            args: [proof],
          });
          if (hash) {
            setVerified(true);
            setTransactionHash(hash);
          }
        }}
      >
        Verify Proof
      </button>
      {verified && (
        <div>
          {" "}
          <p>Proof verified</p>
          <a
            href={`https://explorer.execution.testnet.lukso.network/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here to view transaction.
          </a>
        </div>
      )}
      <style jsx="true">{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .button {
          border: solid 1px #ccc;
          margin: 0 0 20px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
