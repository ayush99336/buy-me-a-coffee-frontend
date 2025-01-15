"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";

interface Memo {
    from: string;
    name: string;
    message: string;
    timestamp: string;
    amount: string;
}

const Home = () => {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [currentAccount, setCurrentAccount] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [amount, setAmount] = useState<string>("");

    // Fetch memos on component mount
    useEffect(() => {
        fetchMemos();
    }, []);

    // Fetch Memos Function
    const fetchMemos = async () => {
        try {
            if (!window.ethereum) {
                alert("MetaMask is not installed! Please install it to use this app.");
                return;
            }

            const provider = new BrowserProvider(window.ethereum);
            const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

            const memos = await contract.getMemos();
            setMemos(
                memos.map((memo: any) => ({
                    from: memo.from,
                    name: memo.name,
                    message: memo.message,
                    timestamp: new Date(Number(memo.timestamp) * 1000).toLocaleString(),
                    amount: formatEther(memo.amount),
                }))
            );
        } catch (error) {
            console.error("Error fetching memos:", error);
        }
    };

    // Buy Coffee Function
    const buyCoffee = async () => {
        if (!name || !message || !amount) {
            alert("Please fill in all fields!");
            return;
        }

        try {
            if (!window.ethereum) {
                alert("MetaMask is not installed! Please install it to use this app.");
                return;
            }

            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.buyCoffee(name, message, {
                value: parseEther(amount),
            });

            console.log("Transaction sent:", tx.hash);
            await tx.wait();
            console.log("Transaction mined:", tx.hash);

            alert("Coffee purchased successfully!");
            setName("");
            setMessage("");
            setAmount("");
            fetchMemos(); // Refresh the memos
        } catch (error) {
            console.error("Error buying coffee:", error);
        }
    };

    // Connect Wallet Function
    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert("MetaMask is required! Please install it.");
                return;
            }

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
    };

    return (
      <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">Buy Me A Coffee</h1>
      {currentAccount ? (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
              Connected to: <strong>{currentAccount}</strong>
          </div>
      ) : (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
              Wallet not connected
          </div>
      )}
      {currentAccount ? (
          <div className="w-full max-w-md bg-white rounded shadow-md p-6">
              {/* Form for buying coffee */}
              <h2 className="text-lg font-semibold mb-4">Leave a message:</h2>
              <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mb-2 p-2 border border-gray-300 rounded focus:outline-blue-500"
              />
              <textarea
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full mb-2 p-2 border border-gray-300 rounded focus:outline-blue-500"
              />
              <input
                  type="text"
                  placeholder="Amount (ETH)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-blue-500"
              />
              <button
                  onClick={buyCoffee}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              >
                  Buy Coffee
              </button>
  
              {/* Memos */}
              <h2 className="text-lg font-bold mt-6 text-slate-900 ">Memos:</h2>
<ul className="mt-4">
    {memos.map((memo, index) => (
        <li
            key={index}
            className="bg-gray-100 p-4 rounded shadow mb-4 border border-gray-200"
        >
            <p className="text-blue-600 font-bold">{memo.name}</p>
            <p className="text-gray-700 italic mb-2">"{memo.message}"</p>
            <p className="text-green-500">Sent: {memo.amount} ETH</p>
            <p className="text-sm text-gray-500">At: {memo.timestamp}</p>
        </li>
    ))}
</ul>

          </div>
      ) : (
          <button
              onClick={connectWallet}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
          >
              Connect Wallet
          </button>
      )}
  </div>
  
    );
};

export default Home;
