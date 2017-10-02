pragma solidity ^0.4.4;


contract Lottery {
	address[16] public members;

	uint public memberCount = 0;
	uint public nonce = 0;
	uint lotteryIndex;

	event PrintValues(uint lotteryIndex2, uint nonce2);

	function signForLottery(address memberAddress) public returns (bool) {
		require(memberCount <= 15);
		members[memberCount] = memberAddress;
		memberCount++;

		return true;
	}

	function selectLotteryWinner() public returns (address) {
		address winner;
		nonce++;
		lotteryIndex = uint(sha3(nonce))%(0+15);

		uint spinCount = 0;
		for (uint i = 0; i < lotteryIndex; i++) {
			winner = members[spinCount];
			spinCount = (spinCount + 1) % memberCount;
		}

		PrintValues(lotteryIndex, nonce);
		return winner;
	}

	function getMembers() public returns (address[16]) {
		return members;
	}

	function getLotteryIndex() public returns (uint) {
		return lotteryIndex;
	}


}
