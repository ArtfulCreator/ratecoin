// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import ratecoin_artifacts from '../../build/contracts/RateCoin.json'
import ratingcontract_artifacts from '../../build/contracts/RatingContract.json'

var RateCoin = contract(ratecoin_artifacts);
var RatingContract = contract(ratingcontract_artifacts);

var accounts;
//Owner account
var account;

var ownerAccount;

window.App = {
  web3Provider: null,
  contracts: {
  },


  start: function() {

    // Load products.
    $.getJSON('../products.json', function(data) {


      var productsRow = $('#productsRow');
      var productTemplate = $('#productTemplate');

      for (var i = 0; i < data.length; i ++) {
        productTemplate.find('.panel-title').text(data[i].name);
        productTemplate.find('img').attr('src', data[i].image);
        productTemplate.find('.product-upc').text(data[i].upc);
        productTemplate.find('.btn-view').attr('data-id', data[i].upc);
        productTemplate.find('.btn-write').attr('data-id',data[i].upc);

        productsRow.append(productTemplate.html());
      }
    });

    App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC.
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {

    var self = this;

    // Bootstrap the RateCoin abstraction for Use.
    RateCoin.setProvider(web3.currentProvider);

    //Bootsrap RatingContract
    RatingContract.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

     accounts = accs;
     account = accounts[0];

        var meta;
        RateCoin.deployed().then(function(instance) {
          meta = instance;


            var output1 = [];
            output1.push(meta.getOwnerAccount.call());

            var myPromises = output1;

            Promise.all(myPromises).then(function(data) {
                ownerAccount = data[0];
                self.refreshBalance();
                self.displayLoggedAccount();
            });

        });


    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-view', App.getReviews);
    $(document).on('click', '.btn-write', App.sendUPCToDialog);
    $(document).on('click', '.btn-submit-review', App.writeReview);
    $(document).on('click', '.btn-submit-like', App.likeReview);
    $(document).on('click', '.btn-pay', App.payForReview);
  },

  displayLoggedAccount: function () {
    var loggedAccountLabel = document.getElementById("loggedAccount");
    var ownerAccountLabel = document.getElementById("ownerAccount");
    loggedAccountLabel.innerHTML = account.valueOf();
    ownerAccountLabel.innerHTML = ownerAccount.valueOf();

  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    var meta;
    RateCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function(receiver, amount) {
    var self = this;

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    RateCoin.deployed().then(function(instance) {
      meta = instance;

      return meta.sendCoin(receiver, amount, {from: ownerAccount});
    }).then(function() {
      self.setStatus("Transaction complete!");

      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  payForReview:function(){

  event.preventDefault();

    var reviewDialog = $('#viewReviewsModal');
    var reviewTemplate = $('#reviewTemplate');
    var upc =  reviewDialog.find(".upc").text();

    //get the pay button id
    var reviewID = $(this).data('id');

    var reviewer =  reviewTemplate.find(".reviewer").text();

    App.sendCoin(reviewer, 100);
  },


  sendUPCToDialog: function(){
    event.preventDefault();
    var upc = $(this).data('id')

    var reviewDialogTemplate = $('#writeReviewsModal');

    reviewDialogTemplate.find('.upc').text(upc);

    //reset all other values
    var reviewText = reviewDialogTemplate.find(".reviewText").val('');

    var reviewStarForm = document.getElementById("writeForm");
    var radios = reviewStarForm.elements["reviewStars"];

    for(var  i=0;i<radios.length;i++) {
        if(radios[i].checked == true) {
            radios[i].checked = false;
            break;
        }
    }

  },

  getReviews: function() {
      event.preventDefault();
    var upc =  $(this).attr("data-id");
    var ratingInstance;


    var noOfReviews;


    RatingContract.deployed().then(function(instance) {
      ratingInstance = instance;

      return ratingInstance.getNumberOfReviews.call(upc);


    }).then(function(noOfReviews) {


        App.displayReviews(noOfReviews, upc, ratingInstance);

   })},

  displayReviews: function (noOfReviews, upc, ratingInstance) {



        var reviewDialogTemplate = $('#viewReviewsModal');

        reviewDialogTemplate.find('.upc').text(upc);

        var reviewsRow = $('#reviewsRow');
        reviewsRow.empty();
        var reviewTemplate = $('#reviewTemplate');



          for (var i = 0; i < noOfReviews; i++) {

                /**
                    Below code is required to compile multiple asynchronous Promise calls and make sure they all complete before we load the DOM
                */

                var output1 = [];
                output1.push(ratingInstance.getReviewStars.call(upc,i));
                output1.push(ratingInstance.getReviewText.call(upc,i));
                output1.push(ratingInstance.getReviewer.call(upc,i));
                output1.push(ratingInstance.getNumberOfLikes.call(upc,i));
                output1.push(i);


                var myPromises = output1;

                Promise.all(myPromises).then(function(data) {

                        var reviewStarsElem = reviewTemplate.find('.reviewStars');

                        var length = parseInt(data[0])+1;

                        var x=Array(length).join("*");

                        reviewStarsElem.text(x);

                      reviewTemplate.find('.reviewText').text(data[1]);
                      reviewTemplate.find('.reviewer').text(data[2]);
                      reviewTemplate.find('.noOfLikes').text(data[3]);
                      //set the like button id
                      reviewTemplate.find(".btn-submit-like").attr('data-id',data[4]);
                      if(ownerAccount!=account) {
                        reviewTemplate.find('.btn-pay')[0].style.visibility= "hidden";
                      }
                      reviewsRow.append(reviewTemplate.html());
                });

          }


        $('#viewReviewsModal').modal('show');

   },



   writeReview: function() {

        event.preventDefault();

        var reviewDialog = $('#writeReviewsModal');

        var upc =  reviewDialog.find(".upc").text();

        var reviewText = reviewDialog.find(".reviewText").val();

        var reviewStarForm = document.getElementById("writeForm");
        var reviewStars = reviewStarForm.elements["reviewStars"].value;

        RatingContract.deployed().then(function(instance) {
          var ratingInstance = instance;
          //first check if there is a review already for the UPC by same sender
          var reviewID = 0;


          ratingInstance.isReviewPresent.call(upc, account).then(function(senderCheck) {
            if(!senderCheck) {

                reviewID = ratingInstance.addReview(upc,reviewStars, reviewText, {from:account,gas: 200000});


            }
            else{
                alert("You have already submitted a review for this Product.");
            }
          });


        }).catch(function(err) {
          console.log(err);
        });

  },


  likeReview: function() {

        event.preventDefault();

        var reviewDialog = $('#viewReviewsModal');
        var reviewTemplate = $('#reviewTemplate');
        var upc =  reviewDialog.find(".upc").text();

        //get the like button id
        var reviewID = $(this).data('id');
        RatingContract.deployed().then(function(instance) {
          var ratingInstance = instance;

            //Reject if user already liked this review
          ratingInstance.isLikePresent.call(upc, reviewID, account).then(function(isLikePresent) {


            if(!isLikePresent) {


                ratingInstance.addLike(upc, reviewID, {from:account,gas: 200000}).then(function(success) {console.log(success);});

                document.getElementById("viewReviewsModal").reload();
            }
            else{
               alert("You have already liked this review.");

            }
          });


        }).catch(function(err) {
          console.log(err);
        });

  },


};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
