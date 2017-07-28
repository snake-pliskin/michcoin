module.exports = {
  networks: {
    kovan: {
      host: "localhost",
      port: 8545,
      network_id: "42" // Match any network id
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
