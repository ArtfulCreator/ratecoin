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
    }

    function getReviewStars (uint upcID, uint reviewID) public returns (uint) {
        var revArr = reviews[upcID];
        return revArr[reviewID].reviewStars;
    }

    function getReviewText(uint upcID, uint reviewID) public returns (string) {
        var revArr = reviews[upcID];
        return revArr[reviewID].reviewText;
    }

    function getReviewer (uint upcID, uint reviewID) public returns (address) {
        var revArr = reviews[upcID];
        var reviewer = revArr[reviewID].reviewer;
        return reviewer;
    }

    function addReview (uint upcID, uint reviewStars, string reviewText ) public returns (uint reviewID){

        reviewID = reviews[upcID].length;
        var revArr = reviews[upcID];

        //check if review was already made by reviewer
        if(moreThanOneReviewBusinessRule(msg.sender,revArr)==false) {

            revArr.length = reviewID+1;
            revArr[reviewID] = Review (msg.sender, reviewStars, reviewText);
        }
        else {
            return reviewID;
        }

    }

    function getNumberOfReviews (uint upcID) public returns (uint noOfReviews) {
        noOfReviews = reviews[upcID].length;
    }


    function isReviewPresent (uint upcID, address reviewer) public returns (bool isReviewPres) {


        isReviewPres = moreThanOneReviewBusinessRule(reviewer, reviews[upcID]);

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
