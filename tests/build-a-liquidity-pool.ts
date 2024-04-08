import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from '@solana/web3.js';
import { BuildALiquidityPool } from "../target/types/build_a_liquidity_pool";
import assert from "assert";


describe("build-a-liquidity-pool", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.BuildALiquidityPool as Program<BuildALiquidityPool>;

  const authority = Keypair.generate();
  const liquidity = Keypair.generate();
  const tipAmount = new anchor.BN(100);
  const links = ["myLink1", "myLink2"];
  const bio = "my Bio";
  const imageUrl = "https://myimage.com";
  const vouchUser = Keypair.generate().publicKey;;
  const vouchComment = "Too real";
  const vouchRequest = {
    vouched_by: vouchUser,
    comment: vouchComment,
  };  
  const messageContent = "message content";

  type Message = {
    sender: PublicKey;
    content: string;
  };

  type Vouch = {
    vouched_by: PublicKey;
    comment: string;
  };


  it("Is initialized!", async () => {
    // Add your test here.
    await program.rpc.initialize({
      accounts: {
        liquidity: liquidity.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [authority, liquidity],
    });

    const liquidityAccount = await program.account.liquidity.fetch(liquidity.publicKey);
    assert.equal(liquidityAccount.owner.toString(), authority.publicKey.toString());
  });

  it('Creates a liquidity', async () => {
    await program.rpc.createliquidity(bio, {
      accounts: {
        liquidity: liquidity.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [authority, liquidity],
    });

    const liquidityAccount = await program.account.liquidity.fetch(liquidity.publicKey);
    assert.equal(liquidityAccount.bio, bio);
  });

  it('Stores links', async () => {
    await program.rpc.storeLinks(links, {
      accounts: {
        liquidity: liquidity.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [authority, liquidity,
    });

    const liquidityAccount = await program.account.liquidity.fetch(liquidity.publicKey);
    assert.deepEqual(liquidityAccount.links, links);
  });

  it('Stores an image URL', async () => {
    await program.rpc.storeImage(imageUrl, {
      accounts: {
        liquidity: liquidity.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [authority, liquidity],
    });

    const liquidityAccount = await program.account.liquidity.fetch(liquidity.publicKey);
    assert.equal(liquidityAccount.imageUrl, imageUrl);
  });

  it('Requests a vouch for the portfolio', async () => {
    await program.rpc.requestVouch(vouchRequest, {
      accounts: {
        liquidity: liquidity.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [liquidity],
    });

    const liquidityAccount = await program.account.liquidity.fetch(liquidity.publicKey);
    assert.deepEqual(liquidityAccount.vouchRequests[0], vouchRequest);
  });

  it('Approves a vouch for the liquidity', async () => {
    await program.rpc.approveVouch(vouchUser, {
      accounts: {
        liquidity: liquidity.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [authority, portfolio],
    });

    const liquidityAccount = await program.account.liquidity.fetch(liquidityportfolio.publicKey);
    const vouches = liquidityAccount.vouches as Array<Vouch>;
    assert.equal(vouches[0].vouched_by.toString(), vouchUser.toString());
});

it('Sends a message to the liquidity owner', async () => {
    await program.rpc.sendMessage(messageContent, {
      accounts: {
        liquidity: liquidity.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [authority, liquidity],
    });

    const liquidityAccount = await program.account.liquidity.fetch(liquidity.publicKey);
    const messages = liquidityAccount.messages as Array<Message>;
    assert.equal(messages[0].content, messageContent);
    assert.equal(messages[0].sender.toString(), authority.publicKey.toString());
});

  it('Receives a tip', async () => {

    await program.rpc.tip(tipAmount, {
      accounts: {
        liquidity: liquidity.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [liquidity],
    });

    const liquidityAccount = await program.account.liquidity.fetch(liquidity.publicKey);
    assert.equal(liquidityAccount.tipAmount, tipAmount);
  });
});
