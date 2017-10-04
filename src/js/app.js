App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].name);

        petsRow.append(petTemplate.html());
      }


    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there is an injected web3 instance?
//    if (typeof web3 !== 'undefined') {
//      App.web3Provider = web3.currentProvider;
//      web3 = new Web3(web3.currentProvider);
//    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC.
      App.web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
//    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Lottery.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var LotteryArtifact = data;
      App.contracts.Lottery = TruffleContract(LotteryArtifact);

      // Set the provider for our contract.
      App.contracts.Lottery.setProvider(App.web3Provider);
		App.contracts.Lottery.deployed().then(function(instance){
        		var printValuesEvent = instance.PrintValues(null,{fromBlock: 0, toBlock: 'latest'});
        		printValuesEvent.watch(function(error, result){
        			alert("index = " + result.args.lotteryIndex + "nonce = " + result.args.nonce2);
        			if (!error)
        				console.log(result);
        		});

        		 instance.allEvents({fromBlock: 0, toBlock: 'latest'}, function(error, log){
                  alert("allEvent");
                  if (!error)
                    console.log(log);
                });
        	});


      // Use our contract to retieve and mark the adopted pets.
//      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '#runLottery', App.selectLotteryWinner);
  },

  selectLotteryWinner: function() {
	event.preventDefault();
	var adoptionInstance;

	App.contracts.Lottery.deployed().then(function(instance) {
	  adoptionInstance = instance;

	  return adoptionInstance.selectLotteryWinner.call();
	}).then(function(winner) {
//	  alert(winner);
		console.log("winner = " + winner);
	}).catch(function(err) {
	  console.log(err.message);
	});


	App.contracts.Lottery.deployed().then(function(instance) {
	  adoptionInstance = instance;

	  return adoptionInstance.getLotteryIndex.call();
	}).then(function(winner) {
		console.log("index = " + winner);
	}).catch(function(err) {
	  console.log(err.message);
	});
  },

  handleAdopt: function() {
    event.preventDefault();

    var address = $(event.target).data('id');
    console.log("address= " + address);

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Lottery.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.signForLottery(account, {from: account});
      }).then(function(result) {
//        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Pending...').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
