require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "rinkeby",
  networks: {
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/de58cc51678d46aa8d934e7d2b4d8f28",
      accounts: [
        "00269013f1daa829d210cd81ee18af8e0633c8a401228d8183b67fbe8a4b329f",
      ],
    },
  },
};
