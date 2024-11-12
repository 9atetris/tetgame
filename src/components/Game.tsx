import React, { useEffect, useState } from 'react'
import { TfiControlPlay, TfiFaceSad, TfiGift, TfiWallet } from 'react-icons/tfi'; 
import { toast } from 'react-toastify';
import {Contract, cairo, AccountInterface} from 'starknet'

import { SessionAccountInterface } from "@argent/tma-wallet";

import gameAbi from '../../utils/Abi/game.json';
import { FaSpinner } from 'react-icons/fa6';

// Propsのインターフェースを定義
interface GameProps {
    account: SessionAccountInterface | undefined;
  }

  function Game({ account }: GameProps) {

    const [ind, setInd] = useState<any>();
    const [ans, setAns] = useState<any>();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isUserCorrect, setIsUserCorrect] = useState(false);

    const [plays, setPlays] = useState<any>(0);
    const [points, setPoints] = useState<any>(0);

    const [pending, setPending] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const game_addr = "0x5f2bf091c03af0f14973d16b556033e0c0e31d5c2ff6199af68d787854c011c";

    //account as unknown as AccountInterfaceは推奨されない方法
    const gameContract = new Contract(gameAbi, game_addr, (account as unknown as AccountInterface));

    const alphabets = 'abcdefghijklmnopqrstuvwxyz'.split('');

    const start = () => {
        
        let indexed = []

        for(let i: number = 0; i < 9; i++) {
            let num = Math.floor(Math.random() * 10)

            indexed.push(num)

        }

        setAns(alphabets[indexed[Math.floor(Math.random() * 10)]])

        setInd(indexed)

        console.log(ans)
    }

    const compareAns = (a: String) => {

        setPlays(plays + 1)

        if(a == ans) {
            setIsUserCorrect(true)
            setIsModalVisible(true);
            setPlays(0)
            setPoints(points + 2)
            start()
        }else{
            setIsUserCorrect(false)
            setIsModalVisible(true);
        }

    }

    const handleCliamRewards = async () => {
        setPending(true)
       try {

            await gameContract.claimPoints(Number(points)) 

            setPending(false)
            setPoints(0)
            toast.success("reward cliamed");
       } catch (error: any) {
            setPending(false)
            toast.error(error.message)
            setError(error.message)
       }

    }

    const closeModal = () => {
        setIsModalVisible(false);
      };

    useEffect(() => {
        // Automatically close the modal after 1 second
        const timer = setTimeout(() => {
          closeModal();
        }, 1000);
    
        // Clean up the timer
        return () => clearTimeout(timer);
      }, [compareAns]);
   

    if(!pending) {
        return (
            <div className='h-inherit gap-y-4 mt-2  grid grid-cols-1'>
                {/* <span className='bg-slate-200 p-2 items-center rounded-lg flex gap-x-4 items-center mr-auto'>
                    <TfiWallet />
                    <small className='text-blue-700'>STRK <small className='font-bold text-[15px] text-slate-700'>{4}</small></small> 
                </span> */}
                <div className='flex border border-slate-300 p-2 justify-between'>
                    <button onClick={start} className='py-2 px-4 text-3xl text-red-600 font-bold'>start</button>
                    <div className='flex items-center gap-x-4 text-[22px]'>
                        <div className='flex items-center gap-x-2'><small className='font-bold text-slate-600'>{plays}</small><TfiControlPlay /></div>
                        <div className='flex items-center gap-x-2'><small className='font-bold text-green-600'>${points}</small><TfiGift /></div>
                    </div>
                </div>
        
               {ind && ind.length > 0 && <div className='grid grid-cols-3 gap-6'>
                     {ind.map((item: any) => (
                        <input type='button' onClick={(e) => {
                            const target = e.target as HTMLInputElement;
                            compareAns(target.value)
                        }} value={alphabets[item]} className='text-3xl hover:bg-orange-200 text-center text-slate-700 bg-white rounded-[15px] shadow-md font-bold p-5'/>
                     ))} 
                </div>}
        
                <div className=' p-2 flex justify-center gap-x-8'>
                    <button onClick={handleCliamRewards} className='border gap-y-2   p-5 flex flex-col items-center bg-lime-200 bg-opacity-50'>
                        <TfiGift size={30} />
                        <small className='font-semibold'>cliam reward</small>
                    </button>
                    <button onClick={start} className='border w-[25%] gap-y-2  p-5 flex flex-col items-center'>
                        <TfiFaceSad size={30} color=''/>
                        <small className='font-semibold'>reshuffle</small>
                    </button>
                </div>
               {/* loading state */}
                {error && error != '' &&<div>
                    <p>{error}</p>
                </div>}

                {/* modal */}
                {isModalVisible && <div className='top-0 grid grid-cols-1 h-screen bg-black w-full fixed bg-opacity-60'>
                    <div className='w-full m-auto  flex flex-col'>
                        {isUserCorrect ? 
                        <div className='flex flex-col justify-center gap-x-4'>
                            <h4 className='text-center'> 🎉</h4>
                            <h4 className='text-white text-center text-bold'>GO CLIAM YOUR REWARD +2 !!!!</h4>
                        </div> 
                        :
                    
                        <div className='flex flex-col justify-center gap-x-4'>
                            <h4 className='text-center text-[40px]'>❌</h4>
                            <h4 className='text-white text-center text-bold'>TRY AGAIN !!!!</h4>
                        </div>
                    }

                    </div>
                </div>}
            </div>
          )
    } else {
        return (
            <div className='w-full flex flex-col text-green-600 font-bold'>
                <div className='flex flex-col gap-y-4 items-center p-5 m-auto w-full'>
                    <FaSpinner size={40} className='animate-spin'/>
                    <small className='m-auto text-slate-400'>Claiming Reward....</small>
                    <small className='text-slate-400'>To Players wallet 👇🏼</small>
                    <small className='m-auto text-[8px]'>{account?.address}</small>
                </div>
            </div>
        )
    }
  
}

export default Game
