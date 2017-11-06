var ConvertLib = artifacts.require("./ConvertLib.sol");
var RateCoin = artifacts.require("./RateCoin.sol");
var ratingContract = artifacts.require("./RatingContract.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, RateCoin);
  deployer.deploy(RateCoin);
  deployer.deploy(ratingContract);
};
