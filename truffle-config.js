module.exports = {
  contracts_build_directory: "./src/contracts",
  networks: {
    development: {
      host: "127.0.0.1",       // Address of the Ethereum development network
      port: 7545,              // Port that the Ethereum development network is running on
      network_id: "*",         // Connect to any network ID
      gas: 5000000,            // Gas limit for transactions
    },
  },
  compilers: {
    solc: {
      version: "0.8.7",        // Solidity compiler version, ensure it matches your smart contract version
      settings: {
        optimizer: {
          enabled: true,       // Enable optimizer
          runs: 200            // Number of optimization runs
        },
      }
    }
  }
};
