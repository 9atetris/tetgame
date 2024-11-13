import { useEffect, useState } from 'react';
import { TfiControlPlay, TfiFaceSad, TfiGift } from 'react-icons/tfi';
import { toast } from 'react-toastify';
import { Contract, AccountInterface } from 'starknet';
import { SessionAccountInterface } from '@argent/tma-wallet';
import gameAbi from '../../utils/Abi/game.json';
import { FaSpinner } from 'react-icons/fa6';

// Propsのインターフェースを定義
interface GameProps {
  account: SessionAccountInterface | undefined;
}

function Game({ account }: GameProps) {
  const [ind, setInd] = useState<number[]>([]);
  const [ans, setAns] = useState<string>('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUserCorrect, setIsUserCorrect] = useState(false);

  const [plays, setPlays] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);

  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const game_addr = '0x5f2bf091c03af0f14973d16b556033e0c0e31d5c2ff6199af68d787854c011c';

  // AccountInterfaceへの型変換を安全に行う
  const gameContract = account ? new Contract(gameAbi, game_addr, account as unknown as AccountInterface) : null;

  const alphabets = 'abcdefghijklmnopqrstuvwxyz'.split('');

  const start = () => {
    let indexed: number[] = [];

    for (let i = 0; i < 9; i++) {
      let num = Math.floor(Math.random() * 26); // 0から25までの数字
      indexed.push(num);
    }

    setAns(alphabets[indexed[Math.floor(Math.random() * indexed.length)]]);

    setInd(indexed);
  };

  useEffect(() => {
    console.log('正解のアルファベット:', ans);
  }, [ans]);

  const compareAns = (a: string) => {
    setPlays((prevPlays) => prevPlays + 1);

    if (a === ans) {
      setIsUserCorrect(true);
      setIsModalVisible(true);
      setPlays(0);
      setPoints((prevPoints) => prevPoints + 2);
      start();
    } else {
      setIsUserCorrect(false);
      setIsModalVisible(true);
    }
  };

  const handleClaimRewards = async () => {
    setPending(true);
    try {
      if (gameContract) {
        await gameContract.claimPoints(points);
        setPending(false);
        setPoints(0);
        toast.success('Reward claimed');
      } else {
        throw new Error('Account is not connected');
      }
    } catch (error: any) {
      setPending(false);
      toast.error(error.message);
      setError(error.message);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (isModalVisible) {
      const timer = setTimeout(() => {
        closeModal();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isModalVisible]);

  if (!pending) {
    return (
      <div className="h-inherit gap-y-4 mt-2 grid grid-cols-1">
        <div className="flex border border-slate-300 p-2 justify-between">
          <button onClick={start} className="py-2 px-4 text-3xl text-red-600 font-bold">
            Start
          </button>
          <div className="flex items-center gap-x-4 text-[22px]">
            <div className="flex items-center gap-x-2">
              <small className="font-bold text-slate-600">{plays}</small>
              <TfiControlPlay />
            </div>
            <div className="flex items-center gap-x-2">
              <small className="font-bold text-green-600">${points}</small>
              <TfiGift />
            </div>
          </div>
        </div>

        {ind && ind.length > 0 && (
          <div className="grid grid-cols-3 gap-6">
            {ind.map((item: number, index: number) => (
              <input
                key={index}
                type="button"
                onClick={(e) => {
                  compareAns(e.currentTarget.value);
                }}
                value={alphabets[item]}
                className="text-3xl hover:bg-orange-200 text-center text-slate-700 bg-white rounded-[15px] shadow-md font-bold p-5"
              />
            ))}
          </div>
        )}

        <div className="p-2 flex justify-center gap-x-8">
          <button
            onClick={handleClaimRewards}
            className="border gap-y-2 p-5 flex flex-col items-center bg-lime-200 bg-opacity-50"
          >
            <TfiGift size={30} />
            <small className="font-semibold">Claim Reward</small>
          </button>
          <button onClick={start} className="border w-[25%] gap-y-2 p-5 flex flex-col items-center">
            <TfiFaceSad size={30} color="" />
            <small className="font-semibold">Reshuffle</small>
          </button>
        </div>
        {/* エラーメッセージ表示 */}
        {error && error !== '' && (
          <div>
            <p>{error}</p>
          </div>
        )}

        {/* モーダル表示 */}
        {isModalVisible && (
          <div className="top-0 grid grid-cols-1 h-screen bg-black w-full fixed bg-opacity-60">
            <div className="w-full m-auto flex flex-col">
              {isUserCorrect ? (
                <div className="flex flex-col justify-center gap-x-4">
                  <h4 className="text-center">🎉</h4>
                  <h4 className="text-white text-center font-bold">GO CLAIM YOUR REWARD +2 !!!!</h4>
                </div>
              ) : (
                <div className="flex flex-col justify-center gap-x-4">
                  <h4 className="text-center text-[40px]">❌</h4>
                  <h4 className="text-white text-center font-bold">TRY AGAIN !!!!</h4>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="w-full flex flex-col text-green-600 font-bold">
        <div className="flex flex-col gap-y-4 items-center p-5 m-auto w-full">
          <FaSpinner size={40} className="animate-spin" />
          <small className="m-auto text-slate-400">Claiming Reward....</small>
          <small className="text-slate-400">To Player's wallet 👇🏼</small>
          <small className="m-auto text-[8px]">{account?.address}</small>
        </div>
      </div>
    );
  }
}

export default Game;
