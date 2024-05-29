import { abi, contractAddress } from './constants.js';

import { ethers } from './ethers-5.1.esm.min.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const getBalanceButton = document.getElementById('getBalanceButton');
const withdrawButton = document.getElementById('withdrawButton');

document.getElementById('ethAmount').addEventListener('input', function () {
    var inputValue = this.value;
    console.log('ethAmount input: ', inputValue);
    console.log('type of ethAmount input: ', typeof inputValue);
});

connectButton.onclick = connect;
fundButton.onclick = fund;
getBalanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('I see a Metamask');
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Metamask connected');
        connectButton.innerHTML = 'Connected';
    } else {
        console.log('No Metamask');
        connectButton.innerHTML = 'Please install Metamask';
    }
}

async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log('balance: ', ethers.utils.formatEther(balance));
    } else {
        console.log('No Metamask');
        connectButton.innerHTML = 'Please install Metamask';
    }
}

async function fund() {
    const ethAmount = document.getElementById('ethAmount').value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== 'undefined') {
        // provider -> connection to blockchain
        // signer with some eth
        // ABI & contract address -> contract that we're interacting with
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            // hey, wait for this TX to be finished
            await listenForTransactionMine(transactionResponse, provider);
            console.log('Done!');
        } catch (error) {
            console.log('error', error);
        }
        // listen for the tx to be mined
        // listen for an event <- we haven't learn about yet!
    }
}

async function withdraw() {
    if (typeof window.ethereum !== 'undefined') {
        // provider -> connection to blockchain
        // signer with some eth
        // ABI & contract address -> contract that we're interacting with

        const provider = new ethers.providers.JsonRpcProvider(
            'http://localhost',
        );
        const signer = new ethers.Wallet(
            'private_key_of_owner_of_contract',
            provider,
        );
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            // hey, wait for this TX to be finished
            await listenForTransactionMine(transactionResponse, provider);
            console.log('Done!');
        } catch (error) {
            console.log('error', error);
        }
        // listen for the tx to be mined
        // listen for an event <- we haven't learn about yet!
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    // listen for this transaction to be finished
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`,
            );
            resolve();
        });
    });
}
