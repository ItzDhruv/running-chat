import nacl from "tweetnacl";
import crypto from "crypto";

// Helpers
function buf2hex(buf) {
  return Buffer.from(buf).toString("hex");
}
function hex2buf(hex) {
  return Buffer.from(hex, "hex");
}

// --- Each user generates a permanent keypair ---
function generateUserKeys() {
  const kp = nacl.box.keyPair(); // X25519 keys
  return {
    publicKey: kp.publicKey,   // share to server
    privateKey: kp.secretKey,  // keep private
  };
}

// --- Derive shared secret using your private + peer public ---
function deriveSharedKey(ownPriv, peerPub) {
  return nacl.box.before(peerPub, ownPriv); // 32 bytes shared secret
}

// --- Derive symmetric AES key from shared secret using HKDF ---
function deriveAESKey(sharedSecret) {
  return crypto.hkdfSync("sha256", Buffer.alloc(0), sharedSecret, "chat-v1", 32);
}

// --- Encrypt with AES-GCM ---
function encryptWithAES(aesKey, plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: buf2hex(iv),
    ct: buf2hex(ciphertext),
    tag: buf2hex(tag),
  };
}

// --- Decrypt ---
function decryptWithAES(aesKey, { iv, ct, tag }) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, hex2buf(iv));
  decipher.setAuthTag(hex2buf(tag));
  const plaintext = Buffer.concat([
    decipher.update(hex2buf(ct)),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

// --- Simulate end-to-end flow ---
(function demo() {
  // Alice & Bob register
  const alice = generateUserKeys();
  const bob = generateUserKeys();

  console.log("Alice Public Key:", buf2hex(alice.publicKey));
  console.log("Bob Public Key:", buf2hex(bob.publicKey));

  // Server stores only public keys
  // Now Alice wants to send Bob a message
  const message = "Hey Bob! Only you can read this 🔒";

  // 1️⃣ Alice derives shared key using her private + Bob’s public
  const sharedAlice = deriveSharedKey(alice.privateKey, bob.publicKey);
  const aesKeyAlice = deriveAESKey(sharedAlice);

  // 2️⃣ Alice encrypts message
  const encMsg = encryptWithAES(aesKeyAlice, message);

  console.log("\nEncrypted message (sent via server):", encMsg);

  // 3️⃣ Bob decrypts message using his private + Alice’s public
  const sharedBob = deriveSharedKey(bob.privateKey, alice.publicKey);
  const aesKeyBob = deriveAESKey(sharedBob);

  const decrypted = decryptWithAES(aesKeyBob, encMsg);
  console.log("\nBob decrypted message:", decrypted);
})();
