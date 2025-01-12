import "./App.css";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import { useState, useEffect } from "react";
import { WagmiProvider, useAccount } from "wagmi";
import { config } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import VerifyProof from "./verify-proof";
import { Account } from "./account";
import { WalletOptions } from "./wallet-options";

const queryClient = new QueryClient();

function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}

function App() {
  const [ready, setReady] = useState(false);
  const [proof, setProof] = useState({});
  const [reclaimProofRequest, setReclaimProofRequest] = useState(null);
  const [requestUrl, setRequestUrl] = useState("");
  const [statusUrl, setStatusUrl] = useState("");

  useEffect(() => {
    async function initializeReclaim() {
      const APP_ID = "0x1046a98608Ff41ECb67d908Ae6A5ED7edf8c9Ba0"; // This is an example App Id Replace it with your App Id.
      const APP_SECRET =
        "0x0b870468426248b8dc3dd4575ee2b95f3a3fc9fce2656bbf1bf96a6a6cac2967"; // This is an example App Secret Replace it with your App Secret.
      const PROVIDER_ID = "6d3f6753-7ee6-49ee-a545-62f1b1822ae5"; // This is GitHub Provider Id Replace it with the provider id you want to use.

      const proofRequest = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        PROVIDER_ID
      );
      setReclaimProofRequest(proofRequest);
    }

    initializeReclaim();
  }, []);

  async function generateVerificationRequest() {
    if (!reclaimProofRequest) {
      console.error("Reclaim Proof Request not initialized");
      return;
    }

    reclaimProofRequest.addContext(
      `user's address`,
      "for acmecorp.com on 1st january"
    );

    const url = await reclaimProofRequest.getRequestUrl();
    setRequestUrl(url);
    const status = reclaimProofRequest.getStatusUrl();
    setStatusUrl(status);

    await reclaimProofRequest.startSession({
      onSuccess: (proof) => {
        console.log("Verification success", proof);
        setProof(proof);
        setReady(true);
        // Your business logic here
      },
      onFailure: (error) => {
        console.error("Verification failed", error);
        // Your business logic here to handle the error
      },
    });
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <ConnectWallet />
          {!requestUrl && (
            <button onClick={generateVerificationRequest}>
              Create Claim QrCode
            </button>
          )}
          {requestUrl && <QRCode value={requestUrl} />}
          {ready && <VerifyProof proof={proof}></VerifyProof>}
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
