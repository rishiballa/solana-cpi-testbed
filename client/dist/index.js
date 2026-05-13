import { test } from "node:test";
import assert from "node:assert/strict";
import { LiteSVM } from "litesvm";
import { address, appendTransactionMessageInstruction, createTransactionMessage, generateKeyPairSigner, lamports, pipe, setTransactionMessageFeePayerSigner, signTransactionMessageWithSigners, setTransactionMessageLifetimeUsingBlockhash, AccountRole } from "@solana/kit";
test("counter contract test", async () => {
    const svm = new LiteSVM();
    const programId = address("11111111111111111111111111111111");
    // ✅ FIX 1: correct order
    svm.addProgramFromFile(programId, "client\\abc.so");
    const payer = await generateKeyPairSigner();
    svm.airdrop(payer.address, lamports(2000000000n));
    const dataAccount = await generateKeyPairSigner();
    // ✅ FIX 2: correct setAccount (YOUR version)
    svm.setAccount({
        address: dataAccount.address,
        lamports: lamports(1000000000n),
        data: new Uint8Array(8), // u64
        executable: false,
        // ✅ REQUIRED fields (your error complained about these)
        programAddress: programId,
        space: 8n
    });
    // ✅ FIX 3: account needs "role"
    const instruction = {
        programAddress: programId,
        accounts: [
            {
                address: dataAccount.address,
                role: AccountRole.WRITABLE, // ✅ REQUIRED
            }
        ],
        data: new Uint8Array([])
    };
    const transaction = await pipe(createTransactionMessage({ version: 0 }), (tx) => setTransactionMessageFeePayerSigner(payer, tx), 
    // ✅ FIX 4: correct API + correct shape
    (tx) => setTransactionMessageLifetimeUsingBlockhash({
        blockhash: svm.latestBlockhash(),
        lastValidBlockHeight: 0n // ✅ dummy value (LiteSVM doesn't need real one)
    }, tx), (tx) => appendTransactionMessageInstruction(instruction, tx), (tx) => signTransactionMessageWithSigners(tx));
    svm.sendTransaction(transaction);
    // ✅ FIX 5: account may not exist → check properly
    const acc = svm.getAccount(dataAccount.address);
    if (!acc || !acc.exists) {
        throw new Error("Account not found");
    }
    const view = new DataView(acc.data.buffer);
    const count = view.getBigUint64(0, true);
    console.log("Counter value:", count);
    assert.strictEqual(count, 1n);
});
//# sourceMappingURL=index.js.map