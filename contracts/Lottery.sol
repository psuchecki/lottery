pragma solidity ^0.4.4;


contract Lottery {
	event PrintWinnerIndex(uint winner_index);

	uint constant ONE_ETHER = 100000000000000000;
	address[16] public members;
	address public winner;
	uint public memberCount = 0;
	bool public lotteryOpen = true;

	modifier lotteryIsOpen() {require(lotteryOpen); _;}
	modifier lotteryIsFinished() {require(!lotteryOpen); _;}

	function signForLottery() payable lotteryIsOpen public returns (bool) {
		require(memberCount <= 15);
		require(msg.value == ONE_ETHER);
		require(isNewMember(msg.sender));

		members[memberCount] = msg.sender;
		memberCount++;

		return true;
	}

	function selectLotteryWinner() lotteryIsOpen public returns (address) {
		require(memberCount > 0);

		uint winnerIndex = uint(block.blockhash(block.number - 1)) % memberCount;
		winner = members[winnerIndex];
		lotteryOpen = false;

		PrintWinnerIndex(winnerIndex);
		return winner;
	}

	function isNewMember(address member) constant returns (bool) {
		for(uint i = 0; i < memberCount; i++) {
			if (members[i] == member) {
				return false;
			}
		}
		return true;
	}

	function withdrawPrice() lotteryIsFinished {
		require(msg.sender == winner);

		//memberCount is equal to amount of deposited ether;
		msg.sender.transfer(memberCount * ONE_ETHER);
		winner = address(0);
		lotteryOpen = true;
		memberCount = 0;
	}


	function getMembers() public returns (address[16]) {
		return members;
	}
}
