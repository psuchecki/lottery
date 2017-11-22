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
            App.refreshState(accountIndex);
        }).catch(function (err) {
            console.log(err.message);
            App.refreshState(accountIndex);
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
            var memberTemplate = $($('#memberTemplate').html());
            var membersTableTbody = $('#membersTable tbody');

            for (i = 0; i < accounts.length; i++) {
                var memberTemplateClone = memberTemplate.clone();
                memberTemplateClone.find('.memberNumber').text(i);
                memberTemplateClone.find('.memberAddress').text(accounts[i]);
                var memberBalance = App.getAccountBalance(accounts[i]);
                memberTemplateClone.find('.memberBalance').text(memberBalance);
                memberTemplateClone.find('.memberActionButton').attr('data-id', i);

                membersTableTbody.append(memberTemplateClone);
            }
        });
    },

    markWinner: function (winner) {
        if (winner == '0x0000000000000000000000000000000000000000') {
            $(".memberRow").removeClass("success");
            return;
        }

        var winnerRow = $('.memberAddress').filter(function () {
            return $(this).text() == winner;
        }).closest("tr");
        winnerRow.removeClass("info");
        winnerRow.addClass("success");

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
            App.refreshState();
        });
    },

    getAccountBalance: function (address) {
        return web3.fromWei(web3.eth.getBalance(address), 'ether').toFixed(2);
    },

    markMember: function (member) {
        var memberRow = $('.memberAddress').filter(function () {
            return $(this).text() == member;
        }).closest("tr");
        memberRow.addClass("info");
        memberRow.find('button').text('Signed...').attr('disabled', true);
    }

    ,refreshState: function (index) {
        if (index != undefined) {
            var row = $('#membersTable').find('tr').eq(index + 1);
            var memberBalance = App.getAccountBalance(web3.eth.accounts[index]);
            row.find('.memberBalance').text(memberBalance);
        }

        var memberCount;
        var lotteryInstance;

        App.contracts.Lottery.deployed().then(function (instance) {
            lotteryInstance = instance;

            return lotteryInstance.memberCount.call();
        }).then(function (count) {
            memberCount = count;
            return lotteryInstance.getMembers.call();
        }).then(function (members) {
            $(".memberActionButton").text('Sign').attr('disabled', false);
            $(".memberRow").removeClass('info');
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
            var membershipFee = web3.toWei(0.1, 'ether');

            App.contracts.Lottery.deployed().then(function (instance) {
                lotteryInstance = instance;

                return lotteryInstance.signForLottery({from: account, value: membershipFee});
            }).then(function () {
                return App.refreshState(accountIndex);
            }).catch(function (err) {
                console.log(err.message);
                App.refreshState(accountIndex);
            });
        });
    },
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
