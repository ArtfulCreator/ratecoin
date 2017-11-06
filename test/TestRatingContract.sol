/**
*
* @author Guna Jayaseelapandian
*/



pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/RatingContract.sol";

contract TestRatingContract {


  function testReviewInfo () {

    RatingContract rateContract = new RatingContract();
    uint upc = 341414123413424;
    var reviewText = "This is my rating";
    var reviewStars = 4;

    var reviewID = rateContract.addReview(upc,reviewStars,reviewText);

    var reviewStarsFromContract = rateContract.getReviewStars(upc, 0);

   Assert.equal(reviewStarsFromContract, reviewStars,"Review stars from contract should be the same" );



  }

  function testAddLike (){

    RatingContract rateContract = new RatingContract();
    uint upc = 341414142121;

    var reviewID = rateContract.addReview(upc,5,"This is my rating");

    //Assert.equal(reviewID, 0, "Review ID should be 0");
    Assert.equal(rateContract.getNumberOfReviews(upc), 1, "One review should be added");

    bool likeSuccess = rateContract.addLike(upc, reviewID);
    Assert.equal(likeSuccess, true, "Like should be added");
      likeSuccess = rateContract.addLike(upc, reviewID);
    Assert.equal(likeSuccess, false, "Like should NOT be added");
    Assert.equal(rateContract.getNumberOfLikes(upc, reviewID), 1, "Both should be 1");



  }

}
