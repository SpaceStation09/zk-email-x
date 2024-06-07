pragma circom 2.1.5;

include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/circuits/utils/regex.circom";
include "./twitter_regex.circom";

/// @notice Circuit to verify input email matches twitter password reset email, and extract the username

template TwitterVerifier(maxHeaderLength, maxBodyLength, n, k, exposeFrom) {
  assert(exposeFrom < 2);

  ///@input emailHeader Email header that are signed(ones in `DKIM-Signature` header) as ASCII int[],
  ///padded as per SHA-256 block size
  signal input emailHeader[maxHeaderLength];
  ///@input emailHeaderLength Length of the email header including the SHA-256 padding
  signal input emailHeaderLength;
  ///@input pubkey RSA pubkey split into k chunks of n bits each
  signal input pubkey[k];
  ///@input signature RSA signature split into k chunks of n bits each
  signal input signature[k];
  ///@input emailBody Email body after the precomputed SHA as ASCII int[], padded as per SHA-256 block size
  signal input emailBody[maxBodyLength];
  ///@input emailBodyLength Length of the email body including the SHA-256 padding
  signal input emailBodyLength;
  ///@input bodyHashIndex Index of the body hash `bh` in the emailHeader
  signal input bodyHashIndex;
  ///@input precomputedSHA Precomputed SHA-256 hash of the email body till bodyHashIndex
  signal input precomputedSHA[32];
  ///@input twitterUsernameIndex Index of the Twitter username in the email body.
  signal input twitterUsernameIndex;
  ///@input address ETH address as identity commitment (to make it as part of the proof)
  signal input address;

  ///@output pubkeyHash Poseidon hash of the pubkey - Poseidon(n/2) (n/2 chunks of pubkey with k*2 bits per chunk)
  signal output pubkeyHash;
  signal output twitterUserName;

  //use @zk-email/EmailVerifier circuit to verify dkim signature & email body hash (if `ignoreBodyHashCheck` set to 0)
  component EV = EmailVerifier(maxHeaderLength, maxBodyLength, n, k, 0);
  EV.emailHeader <== emailHeader;
  EV.pubkey <== pubkey;
  EV.signature <== signature;
  EV.emailHeaderLength <== emailHeaderLength;
  EV.bodyHashIndex <== bodyHashIndex;
  EV.precomputedSHA <== precomputedSHA;
  EV.emailBody <== emailBody;
  EV.emailBodyLength <== emailBodyLength;

  pubkeyHash <== EV.pubkeyHash;

  // 0 for false; non-zero for true
  if(exposeFrom) {}

  //This computes the regex states on each character in the email body. 
  //This is the part you need to customize for other app verification. (using zk-regex)
  signal (twitterFound, twitterReveal[maxBodyLength]) <== TwitterRegex(maxBodyLength)(emailBody);
  // 1 for found matched regex
  twitterFound === 1;

  var maxTwitterUsernameLength = 21;
  signal twitterUserNamePacks[1] <== PackRegexReveal(maxBodyLength, maxTwitterUsernameLength)(twitterReveal, twitterUsernameIndex);

  twitterUserName <== twitterUserNamePacks[0];

}

commitment main { public [ address ] } = TwitterVerifier(1024, 1536, 121, 17, 0);