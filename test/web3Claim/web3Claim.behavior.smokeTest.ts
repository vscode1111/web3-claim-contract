import { expect } from 'chai';
import { waitTx } from '~common';
import { seedData } from '~seeds';
import { ContextBase } from '~types';
import { findEvent, signMessageForClaim } from '~utils';
import { ClaimEventArgs } from './types';

export async function smokeTest(that: ContextBase) {
  await owner2SendsTokens(that);
  await owner2ClaimsToUser1(that);
  await user2ClaimsSig(that);
}

const labels = {
  smokeTest: 'Smoke test',
  owner2SendsTokens: '--Owner2 send tokens to contract if required',
  ownerClaimsToUser1: '--Owner claims tokens to user1',
  user1ClaimsSig: '--User1 claims tokens using signature',
};

export async function owner2SendsTokens(that: ContextBase) {
  console.log(labels.owner2SendsTokens);

  const balance = await that.owner2WEB3Claim.getBalance();
  console.log(`balance: ${balance}`);

  if (balance < seedData.userInitBalance) {
    const diff = seedData.userInitBalance - balance;
    console.log(`diff: ${diff}`);
    await waitTx(that.owner2WEB3Token.transfer(that.web3ClaimAddress, diff), 'transfer');
  }
}

export async function owner2ClaimsToUser1(that: ContextBase) {
  console.log(labels.ownerClaimsToUser1);

  const receipt = await waitTx(
    that.owner2WEB3Claim.claim(
      that.user1Address,
      seedData.amount1,
      seedData.transactionId0,
      seedData.nowPlus1m,
    ),
    'claim',
  );
  const eventLog = findEvent<ClaimEventArgs>(receipt);
  expect(eventLog).not.undefined;
  const [account, amount, transactionIdHash0, timestamp] = eventLog?.args;
  expect(account).eq(that.user1Address);
  expect(amount).eq(seedData.amount1);
  expect(transactionIdHash0).eq(seedData.transactionIdHash0);
  expect(timestamp).closeTo(seedData.now, seedData.timeDelta);

  //await checkTotalBalance(that);
}

export async function user2ClaimsSig(that: ContextBase) {
  console.log(labels.user1ClaimsSig);

  const signature = await signMessageForClaim(
    that.owner2,
    that.user2Address,
    seedData.amount2,
    seedData.transactionId1,
    seedData.nowPlus1m,
  );
  console.log(`signature: ${signature}`);

  const receipt = await waitTx(
    that.user1WEB3Claim.claimSig(
      that.user2Address,
      seedData.amount2,
      seedData.transactionId1,
      seedData.nowPlus1m,
      signature,
    ),
    'claimSig',
  );
  const eventLog = findEvent<ClaimEventArgs>(receipt);
  expect(eventLog).not.undefined;
  const [account, amount, transactionIdHash0, timestamp] = eventLog?.args;
  expect(account).eq(that.user2Address);
  expect(amount).eq(seedData.amount2);
  expect(transactionIdHash0).eq(seedData.transactionIdHash1);
  expect(timestamp).closeTo(seedData.now, seedData.timeDelta);
}

export function shouldBehaveCorrectSmokeTest(): void {
  describe('smoke test', () => {
    it(labels.smokeTest, async function () {
      await smokeTest(this);
    });
  });
}
