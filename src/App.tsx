import { useEffect, useState } from "react";
import { ArgentTMA, SessionAccountInterface } from "@argent/tma-wallet";
import Game from './components/Game';

const argentTMA = ArgentTMA.init({
  environment: "sepolia", // "sepolia" | "mainnet" (not supported yet)
  appName: "tetgame", // Your Telegram app name
  appTelegramUrl: "https://t.me/tetgame_bot/tetgame", // Your Telegram app URL
  sessionParams: {
    allowedMethods: [
      // List of contracts/methods allowed to be called by the session key
      {
        contract:
          "0x5f2bf091c03af0f14973d16b556033e0c0e31d5c2ff6199af68d787854c011c",
        selector: "claimPoints",
      }
    ],
    validityDays: 90 // session validity (in days) - default: 90
  },
});

function App() {
  const [account, setAccount] = useState<SessionAccountInterface | undefined>();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Call connect() as soon as the app is loaded
    argentTMA
      .connect()
      .then((res) => {
        if (!res) {
          // Not connected
          setIsConnected(false);
          setAccount(undefined);
          return;
        }

        // Connected
        const { account, callbackData } = res;

        // Check session status
        const sessionStatus = account.getSessionStatus();
        if (sessionStatus !== "VALID") {
          // Session has expired or scope (allowed methods) has changed
          // A new connection request should be triggered
          // The account object is still available to get access to user's address
          // but transactions can't be executed
          setAccount(account);
          setIsConnected(false);
          return;
        }

        // Session is valid
        setAccount(account);
        setIsConnected(true);
        // Custom data passed to the requestConnection() method is available here
        console.log("callback data:", callbackData);
      })
      .catch((err) => {
        console.error("Failed to connect", err);
        setIsConnected(false);
        setAccount(undefined);
      });
  }, []);

  const handleConnectButton = async () => {
    // If not connected, trigger a connection request
    await argentTMA.requestConnection("custom_callback_data");
  };

  // Useful for debugging
  const handleClearSessionButton = async () => {
    await argentTMA.clearSession();
    setAccount(undefined);
    setIsConnected(false);
  };

  console.log("Account:", account);

  return (
    <div className="h-auto">
      {/* Navbar */}
      <div className="bg-gray-700 p-4 flex ">
        {!isConnected && (
          <button
            className="py-2 px-4 rounded-lg bg-slate-300 text-gray-700"
            onClick={handleConnectButton}
          >
            Connect
          </button>
        )}

        {account && (
          <div className="flex justify-between items-center w-full">
            <p className="text-green-500 text-[12px]">
              Account address: <code>{account.address.slice(0, 12)} ...</code>
            </p>
            <button
              className="text-sm p-2 bg-white rounded-lg bg-tomato-300"
              onClick={handleClearSessionButton}
            >
              Clear Session
            </button>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="grid grid-cols-1">
        {isConnected ? (
          <Game account={account} />
        ) : (
          <p className="text-center mt-4">Please connect your wallet to start the game.</p>
        )}
      </div>
    </div>
  );
}

export default App;
