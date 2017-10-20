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
    const oneEther = web3.toWei(1, 'ether');

    beforeEach(function () {
        return Lottery.new().then(function (instance) {
            lottery = instance;
        });
    });

    // afterEach(function () {
    //     lottery.memberCount.call().then(function (memberCount) {
    //         console.log("memberCount = " + memberCount);
    //     });
    //     lottery.winner.call().then(function (winner) {
    //         console.log("winner = " + winner);
    //     });
    //     lottery.lotteryOpen.call().then(function (lotteryOpen) {
    //         console.log("lotteryOpen = " + lotteryOpen);
    //     });
    // });

    it("Should select single lottery winner", function () {

        return Lottery.deployed().then(function () {
            return lottery.signForLottery({from: account, value: oneEther});
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
            return lottery.signForLottery({from: account, value: oneEther});
        }).then(function () {
            return lottery.signForLottery({from: account1, value: oneEther});
        }).then(function () {
            return lottery.signForLottery({from: account2, value: oneEther});
        }).then(function () {
            return lottery.signForLottery({from: account3, value: oneEther});
        }).then(function () {
            return lottery.signForLottery({from: account4, value: oneEther});
        }).then(function () {
            return lottery.signForLottery({from: account5, value: oneEther});
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
            return lottery.signForLottery({from: account, value: oneEther});
        }).then(function () {
            return lottery.signForLottery({from: account1, value: oneEther});
        }).then(function () {
            return lottery.signForLottery({from: account2, value: oneEther});
        }).then(function () {
            return lottery.selectLotteryWinner({from: account});
        }).then(function () {
            return lottery.winner.call();
        }).then(function (winner) {
            winnerAddress = winner;
            winnerBalanceBeforeWin = web3.fromWei(web3.eth.getBalance(winner), 'ether');
            // console.log("and the winner is = " + winner);
            // console.log("winner balance before winning = " + winnerBalanceBeforeWin);
            return lottery.withdrawPrice({from: winner});
        }).then(function () {
            var winnerBalanceAfterWin = web3.fromWei(web3.eth.getBalance(winnerAddress))
            // console.log("winner balance after winning = " + winnerBalanceAfterWin);
            var difference = Math.round(winnerBalanceAfterWin.toFixed(0)) - Math.round(winnerBalanceBeforeWin.toFixed(0));
            // console.log("difference = " + difference);
            assert.equal(difference, 3, "Wrong price value has been withdrawn");
        });
    });
});