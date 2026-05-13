import { test } from "node:test";
import assert from "node:assert/strict";
import { Account, LiteSVM } from "litesvm";
import { getTransferSolInstruction, systemProgram } from "@solana-program/system";
import {
    AccountRole,
    address,
	appendTransactionMessageInstruction,
	createTransactionMessage,
	generateKeyPairSigner,
	lamports,
	pipe,
	setTransactionMessageFeePayerSigner,
	setTransactionMessageLifetimeUsingBlockhash,
	signTransactionMessageWithSigners,
} from "@solana/kit";



test("it transfers SOL from one wallet to another", async () => {
	
	const svm = new LiteSVM();
	const payer = await generateKeyPairSigner();
   const programkeyplair= await generateKeyPairSigner();
   const programId= programkeyplair.address;

   const cpi= await generateKeyPairSigner();
	svm.addProgramFromFile(programId, "/app/double.so");
    svm.addProgramFromFile(cpi.address,"/app/cpi.so");
    svm.airdrop(payer.address,lamports(2_000_000_000n))
   const blockhash= svm.latestBlockhash();
   const dataAccount=await generateKeyPairSigner();

   const buffer=new Uint8Array(8);
   new DataView(buffer.buffer).setBigUint64(0,0n,true);


      
svm.setAccount({
   address: dataAccount.address,
   lamports:lamports(2000000n),
   data:buffer,
   executable: false,
   programAddress: programId,
   space: 8n
});
const instruction = {
  programAddress: cpi.address,
  accounts: [
    {
      address: dataAccount.address,
      role: AccountRole.WRITABLE
    },
    {
      address: programId,
      role: AccountRole.READONLY
    }
  ],
  data: new Uint8Array()
};




const transaction = await pipe(
		createTransactionMessage({ version: 0 }),
		(tx) => setTransactionMessageFeePayerSigner(payer, tx),
		(tx) => svm.setTransactionMessageLifetimeUsingLatestBlockhash(tx),
		(tx) => appendTransactionMessageInstruction(instruction, tx),
		(tx) => signTransactionMessageWithSigners(tx),
	);
    svm.sendTransaction(transaction);

    const acc=svm.getAccount(dataAccount.address);
    if(!acc || !acc.exists) {
        throw new Error("Account Not Found");
    }
    // console.log(acc.data);
    const view= new DataView(acc.data.buffer);
    const count=view.getBigInt64(0,true);

    console.log("Counter value:", count);







})



   




