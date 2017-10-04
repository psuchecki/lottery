pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Lottery.sol";


contract TestLottery {
	//	Lottery lottery = Lottery(DeployedAddresses.Lottery());
	//	address sampleMember = 0xc459b3ea2c661b696146b042362bee650f4ac98d;
	//
	//	function testMemberCanSignForLottery() {
	////		lottery.signForLottery(0xc459b3ea2c661b696146b042362bee650f4ac98d);
	////		lottery.signForLottery(0xc459b3ea2c661b696146b042362bee650f4ac98d);
	////		lottery.signForLottery(0xd2b30d326008dcefeac7ccf2ba2ae0579ad16150);
	//	}
	//
	//	function testSelectLotteryWinner() {
	//		lottery.signForLottery(sampleMember);
	////		lottery.signForLottery(0xc459b3ea2c661b696146b042362bee650f4ac98d);
	////		lottery.signForLottery(0xd2b30d326008dcefeac7ccf2ba2ae0579ad16150);
	//
	//		address winner = lottery.selectLotteryWinner();
	//		uint index = lottery.getLotteryIndex();
	//
	//		Assert.equal(sampleMember, winner, "Wrong winner");
	//	}
	//
	//	function testGetMembers() {
	//		lottery.signForLottery(sampleMember);
	//		address[16] memory members = lottery.getMembers();
	//
	//
	//		Assert.equal(members[0], sampleMember, "Owner of pet ID 8 should be recorded.");
	//	}
}
