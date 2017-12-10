var Web3 = require("web3");
var Lottery = artifacts.require("./Lottery.sol");

contract('Lottery', function (accounts) {
    var web3 = new Web3();
    var lottery;
    var account = accounts[0];
    var account1 = accounts[1];
    var account2 = accounts[2];
    var account3 = accounts[3];
    var account4 = accounts[4];
    var account5 = accounts[5];

    var provider = new web3.providers.HttpProvider("http://localhost:8545");
    web3.setProvider(provider);
    const membershipFee = web3.toWei(0.1, 'ether');

    beforeEach(function () {
        return Lottery.new().then(function (instance) {
            lottery = instance;
        });
    });

    it("Should select single lottery winner", function () {

        return Lottery.deployed().then(function () {
            return lottery.signForLottery({from: account, value: membershipFee});
        }).then(function () {
            return lottery.selectLotteryWinner({from: account});
        }).then(function () {
            return lottery.winner.call();
        }).then(function (winner) {
            assert.equal(winner, account, "Wrong winner selected");
        });
    });

    it("Should sign multiple members", function () {
        return Lottery.deployed().then(function () {
            return lottery.signForLottery({from: account, value: membershipFee});
        }).then(function () {
            return lottery.signForLottery({from: account1, value: membershipFee});
        }).then(function () {
            return lottery.signForLottery({from: account2, value: membershipFee});
        }).then(function () {
            return lottery.signForLottery({from: account3, value: membershipFee});
        }).then(function () {
            return lottery.signForLottery({from: account4, value: membershipFee});
        }).then(function () {
            return lottery.signForLottery({from: account5, value: membershipFee});
        }).then(function () {
            return lottery.getMembers.call();
        }).then(function (members) {
            // console.log(members);
            assert.equal(members[0], account, "Wrong account signed");
            assert.equal(members[1], account1, "Wrong account signed");
            assert.equal(members[2], account2, "Wrong account signed");
            assert.equal(members[3], account3, "Wrong account signed");
            assert.equal(members[4], account4, "Wrong account signed");
            assert.equal(members[5], account5, "Wrong account signed");
        })
    });

    it("Should winner withdraw his price", function () {
        var winnerBalanceBeforeWin;
        var winnerAddress;
        return Lottery.deployed().then(function () {
            return lottery.signForLottery({from: account, value: membershipFee});
        }).then(function () {
            return lottery.signForLottery({from: account1, value: membershipFee});
        }).then(function () {
            return lottery.signForLottery({from: account2, value: membershipFee});
        }).then(function () {
            return lottery.selectLotteryWinner({from: account});
        }).then(function () {
            return lottery.winner.call();
        }).then(function (winner) {
            winnerAddress = winner;
            winnerBalanceBeforeWin = web3.fromWei(web3.eth.getBalance(winner), 'ether');
            return lottery.withdrawPrice({from: winner});
        }).then(function () {
            var winnerBalanceAfterWin = web3.fromWei(web3.eth.getBalance(winnerAddress))
            var difference = winnerBalanceAfterWin - winnerBalanceBeforeWin;
            assert.equal(difference.toFixed(2), 0.3, "Wrong price value has been withdrawn");
        });
    });
});