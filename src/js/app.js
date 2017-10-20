var web3 = require('web3');

App = {
    web3Provider: null,
    contracts: {},

    init: function () {

        return App.initWeb3();
    },

    initWeb3: function () {
        App.web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    initContract: function () {
        $.getJSON('Lottery.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract.
            var LotteryArtifact = data;
            App.contracts.Lottery = TruffleContract(LotteryArtifact);

            // Set the provider for our contract.
            App.contracts.Lottery.setProvider(App.web3Provider);
            // App.contracts.Lottery.deployed().then(function (instance) {
            //     var printValuesEvent = instance.PrintValues(null, {fromBlock: 0, toBlock: 'latest'});
            //     printValuesEvent.watch(function (error, result) {
            //         alert("index = " + result.args.lotteryIndex + "nonce = " + result.args.nonce2);
            //         if (!error)
            //             console.log(result);
            //     });
            //
            //     instance.allEvents({fromBlock: 0, toBlock: 'latest'}, function (error, log) {
            //         alert("allEvent");
            //         if (!error)
            //             console.log(log);
            //     });
            // });


            // Use our contract to retieve and mark the adopted pets.
            return App.refreshState();
        });

        return App.bindEvents();
    },


    withdrawPrice: function () {
        event.preventDefault();
        var accountIndex = $(event.target).data('id');

        var lotteryInstance;
        var winnerAccount = web3.eth.accounts[accountIndex];

        App.contracts.Lottery.deployed().then(function (instance) {
            lotteryInstance = instance;

            return lotteryInstance.withdrawPrice({from: winnerAccount});
        }).then(function () {
            App.refreshState();
        }).catch(function (err) {
            console.log(err.message);
        });
    },
    handleMemberAction: function () {
        var buttonText = $(event.target).text();
        if (buttonText == "Sign") {
            App.signForLottery();
        } else if (buttonText == "Withdraw") {
            App.withdrawPrice();
        }
    },
    bindEvents: function () {
        $(document).on('click', "#runLottery", App.selectLotteryWinner);
        $(document).on('click', ".memberActionButton", App.handleMemberAction);

        return App.loadMembers();
    },

    loadMembers: function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            var memberTemplate = $('#memberTemplate');
            var membersTable = $('#membersTable');

            for (i = 0; i < accounts.length; i++) {
                membersTable.append(memberTemplate.html());

                row = membersTable.find('tr').eq(i+1);

                row.find('.memberNumber').text(i);
                row.find('.memberAddress').text(accounts[i]);
                var memberBalance = web3.fromWei(web3.eth.getBalance(accounts[i]), 'ether');
                row.find('.memberBalance').text(Math.round(memberBalance.toFixed(2)));
                row.find('.memberActionButton').attr('data-id', i);
            }
        });
    },

    markWinner: function (winner) {
        if (winner == '0x0000000000000000000000000000000000000000') {
            $(".memberRow").removeClass("winnerRow");

            return;
        }

        var winnerRow = $('.memberAddress').filter(function() {
            return $(this).text() == winner;
        }).closest("tr");
        winnerRow.addClass("winnerRow");

        winnerRow.find('button').text('Withdraw').attr('disabled', false);
    },

    selectLotteryWinner: function () {
        event.preventDefault();
        var lotteryInstance;

        App.contracts.Lottery.deployed().then(function (instance) {
            lotteryInstance = instance;

            return lotteryInstance.selectLotteryWinner({from: web3.eth.accounts[0]});
        }).then(function () {
            App.refreshState();
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    getAccountBalance: function (index) {
        return Math.round(web3.fromWei(web3.eth.getBalance(web3.eth.accounts[index]), 'ether'));
    },

    markMember: function (member) {
        var memberRow = $('.memberAddress').filter(function () {
            return $(this).text() == member;
        }).closest("tr");
        memberRow.find('button').text('Signed...').attr('disabled', true);
    }

    , refreshState: function () {
        for (i = 0; i < web3.eth.accounts.length; i++) {
            var row = $('#membersTable').find('tr').eq(i + 1);
            var memberBalance = this.getAccountBalance(i);
            row.find('.memberBalance').text(memberBalance);
        }

        var memberCount;
        var lotteryInstance;

        App.contracts.Lottery.deployed().then(function (instance) {
            lotteryInstance = instance;

            return lotteryInstance.memberCount.call();
        }).then(function(count) {
            memberCount = count;
            return lotteryInstance.getMembers.call();
        }).then(function (members) {
            $(".memberActionButton").text('Sign').attr('disabled', false);
            for (i = 0; i < memberCount; i++) {
                App.markMember(members[i]);
            }
        }).then(function () {
            return lotteryInstance.winner.call();
        }).then(function (winner) {
            App.markWinner(winner);
        }).then(function () {
            return lotteryInstance.lotteryOpen.call();
        }).then(function (lotteryOpen) {
            if (lotteryOpen && memberCount > 0) {
                $("#runLottery").attr('disabled', false);
            } else {
                $("#runLottery").attr('disabled', true);
            }
        }).catch(function (err) {
            console.log(err.message);
        });

    },


    signForLottery: function () {
        event.preventDefault();
        var accountIndex = $(event.target).data('id');

        var lotteryInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[accountIndex];
            var oneEther = web3.toWei(1, 'ether');

            App.contracts.Lottery.deployed().then(function (instance) {
                lotteryInstance = instance;

                return lotteryInstance.signForLottery({from: account, value: oneEther});
            }).then(function () {
                return App.refreshState();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
