/**
*
* RatingContract
* @author Guna Jayaseelapandian
*/


import "./RateCoin.sol";

pragma solidity ^0.4.0;


contract RatingContract {

    //maps UPCS to reviews
    mapping (uint=>Review []) reviews;

    //set of upcs
    uint [] public upcs;



    // Status of transaction. Used for error handling.
    event Status(uint indexed statusCode);

    function RatingContract(){

    }

    //Review struct that maps back to a unique UPC
    struct Review {
        address reviewer;
        uint reviewStars;
        string reviewText;
        address [] likes;
    }

    function getReviewStars (uint upcID, uint reviewID) public constant returns (uint reviewStars1) {
        var revArr = reviews[upcID];
        var reviewStarsStr = revArr[reviewID];
        reviewStars1 = reviewStarsStr.reviewStars;
    }

    function getReviewText(uint upcID, uint reviewID) public constant returns (string reviewText) {
        var revArr = reviews[upcID];
        reviewText = revArr[reviewID].reviewText;
    }

    function getReviewer (uint upcID, uint reviewID) public constant returns (address reviewer ) {
        var revArr = reviews[upcID];
        reviewer = revArr[reviewID].reviewer;

    }

    //Internal call to just get the struct. External calls cannot return structs at this time.

    function getReviewerStruct(uint upcID, uint reviewID) internal constant returns(Review reviewerStruct) {

        var revArr = reviews[upcID];
        reviewerStruct =  revArr[reviewID];

    }


    function addReview (uint upcID, uint reviewStars, string reviewText ) public returns (uint reviewID){

        reviewID = reviews[upcID].length;
        var revArr = reviews[upcID];
        var likes = new address [](0);

        //check if review was already made by reviewer
        if(moreThanOneReviewBusinessRule(msg.sender,revArr)==false) {

            revArr.length = reviewID+1;
            revArr[reviewID] = Review (msg.sender, reviewStars, reviewText,likes);
        }



    }

    function getNumberOfLikes(uint upcID, uint reviewID) public constant returns (uint noOfLikes) {
        var revArr = reviews[upcID];
        var likes = revArr[reviewID].likes;
        noOfLikes = likes.length;
    }


    function addLike (uint upcID, uint reviewID) public returns (bool success){
        var revArr = reviews[upcID];
        var revStruct =  revArr[reviewID];
        var likes = revStruct.likes;

        //check if the user already liked this review
        if(moreThanOneLikeBusinessRule(msg.sender,likes)==false) {
            likes.length = revStruct.likes.length+1;
            likes[revStruct.likes.length-1] = msg.sender;

            return true;

        }
        else {
            return false;
        }

    }



    function getNumberOfReviews (uint upcID) public returns (uint noOfReviews) {
        noOfReviews = reviews[upcID].length;
    }


    /**
    * Checks if a review is already present for the UPC
    */
    function isReviewPresent (uint upcID, address reviewer) public returns (bool isReviewPres) {


        isReviewPres = moreThanOneReviewBusinessRule(reviewer, reviews[upcID]);

    }

    /**
    * Checks if a like is already made by the account for the review
    */
    function isLikePresent ( uint upcID, uint reviewID, address account ) public returns (bool isLikePres) {


        var revArr = reviews[upcID];
        var reviewerStruct =  revArr[reviewID];

        var likes = reviewerStruct.likes;

        if(moreThanOneLikeBusinessRule(account, likes))
        {
            isLikePres = true;
        }
        else
        {
            isLikePres = false;
        }


    }

    /*
    * This rule checks if there is more than one like for an address
    */
    function moreThanOneLikeBusinessRule  (address liker, address[] likes) private returns (bool check ){
        check = false;
        for (uint i=0;i<likes.length;i++) {
            if(likes[i] == liker) {
                check = true;
                break;
            }
        }
    }

    /*
    * This rule checks if there is more than one review for a reviewer
    */
    function moreThanOneReviewBusinessRule  (address reviewer, Review [] revArr) private returns (bool check ){
        check = false;
        for (uint i=0;i<revArr.length;i++) {
            if(revArr[i].reviewer == reviewer) {
                check = true;
                break;
            }
        }
    }

}
