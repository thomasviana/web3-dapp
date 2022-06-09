import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { contractABI, contractAddress } from "../utils/contants";

export const TransactionContext = React.createContext({
    currentAccount: "",
    connectWallet: () => { },
});

const { ethereum } = window;

const createEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionsContract;
};

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));

    const handleChange = (event, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: event.target.value }));
    }

    const checkIfWalletIsConnected = async () => {
        if (!ethereum) return alert("Please install Metamask");
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length) {
            setCurrentAccount(accounts[0]);
        } else {
            console.log("No accounts found");
        }
        console.log(accounts);
    };

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install Metamask");
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    };

    const sendTransaction = async () => {
        try {
            if (ethereum) {
                const { addressTo, amount, keyword, message } = formData;
                const transactionsContract = createEthereumContract();
                const parsedAmount = ethers.utils.parseEther(amount);

                console.log(parsedAmount);
                console.log(parsedAmount.toNumber());

                await ethereum.request({
                    method: "eth_sendTransaction",
                    params: [{
                        from: currentAccount,
                        to: addressTo,
                        gas: "0x5208",
                        value: parsedAmount._hex,
                    }],
                });

                const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

                setIsLoading(true);
                console.log(`Loading - ${transactionHash.hash}`);
                await transactionHash.wait(); // Wait for the tx to be finished
                setIsLoading(false);
                console.log(`Success - ${transactionHash.hash}`);

                const transactionsCount = await transactionsContract.getTransactionCount();
                setTransactionCount(transactionsCount.toNumber());

            } else {
                console.log("No ethereum object");
            }
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object");
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, handleChange, sendTransaction }}>
            {children}
        </TransactionContext.Provider>
    );
};

// export  { TransactionProvider, TransactionContext };
