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
      const APP_ID = "0x6E0338a6D8594101Ea9e13840449242015d71B19"; // This is an example App Id Replace it with your App Id.
      const APP_SECRET =
        "0x1e0d6a6548b72286d747b4ac9f2ad6b07eba8ad6a99cb1191890ea3f77fae48f"; // This is an example App Secret Replace it with your App Secret.
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

    await reclaimClient.buildProofRequest(providerId, true, "V2Linking");

    reclaimClient.setSignature(
      await reclaimClient.generateSignature(
        // this is an MVP, you should not generate the signature on the frontend
        "0x5bdaf747ad9333898a0d9cb613f499d0b00164d7b8230628cf7ffa30fd323372" //TODO : replace with your APP_SECRET
      )
    );

    const { requestUrl } = await reclaimClient.createVerificationRequest();

    setUrl(requestUrl);

    await reclaimProofRequest.startSession({
      onSuccessCallback: (proof) => {
        console.log("Verification success", proof);
        setProof(proof);
        setReady(true);
        // Your business logic here
      },
      onFailureCallback: (error) => {
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
