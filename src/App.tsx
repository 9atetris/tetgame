import './index.css';
import './App.css';
import { useEffect, useState } from "react";
import { ArgentTMA, SessionAccountInterface } from "@argent/tma-wallet";
import Game from './components/Game';

const argentTMA = ArgentTMA.init({
  environment: "sepolia",
  appName: "tetgame",
  appTelegramUrl: "https://t.me/tetgame_bot/tetgame",
  sessionParams: {
    allowedMethods: [
      {
        contract:
          "0x5f2bf091c03af0f14973d16b556033e0c0e31d5c2ff6199af68d787854c011c",
        selector: "claimPoints",
      }
    ],
    validityDays: 90
  },
});

function App() {
  const [account, setAccount] = useState<SessionAccountInterface | undefined>();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    argentTMA
      .connect()
      .then((res) => {
        if (!res) {
          setIsConnected(false);
          setAccount(undefined);
          return;
        }

        const { account, callbackData } = res;

        const sessionStatus = account.getSessionStatus();
        if (sessionStatus !== "VALID") {
          setAccount(account);
          setIsConnected(false);
          return;
        }

        setAccount(account);
        setIsConnected(true);
        console.log("callback data:", callbackData);
      })
      .catch((err) => {
        console.error("Failed to connect", err);
        setIsConnected(false);
        setAccount(undefined);
      });
  }, []);

  const handleConnectButton = async () => {
    await argentTMA.requestConnection("custom_callback_data");
  };

  const handleClearSessionButton = async () => {
    await argentTMA.clearSession();
    setAccount(undefined);
    setIsConnected(false);
  };

  console.log("Account:", account);

  return (
    <div className="h-auto">
      {/* Content */}
      <div className="grid grid-cols-1">
        {isConnected ? (
          <Game account={account} />
        ) : (
          <div className="w-full h-screen flex flex-col items-center justify-center">
            <button
              className="py-2 px-4 rounded-lg bg-slate-300 text-gray-700"
              onClick={handleConnectButton}
            >
              Connect
            </button>
            <p className="mt-4 text-center">
              Please connect your wallet to start the game.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
