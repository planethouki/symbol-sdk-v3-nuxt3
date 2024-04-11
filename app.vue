<template>
  <div>
    <h1>Symbol SDK v3 sample</h1>
    <div>公開鍵：{{ publicKey }}</div>
    <div><button @click="handleSend">トランザクション送信</button></div>
    <div>Status: {{ sendMessage }}</div>
    <div>Transaction Hash: {{ transactionHash }}</div>
  </div>
</template>

<script setup lang="ts">
import { PrivateKey } from 'symbol-sdk';
import { SymbolFacade, Network, KeyPair } from 'symbol-sdk/symbol';

const config = useRuntimeConfig()

const PRIVATE_KEY = config.public.PRIVATE_KEY
const NODE_URL = config.public.NODE_URL

const network = Network.TESTNET

const facade = new SymbolFacade('mainnet')

const privateKey = new PrivateKey(PRIVATE_KEY)
const keyPair = new KeyPair(privateKey)

const textEncoder = new TextEncoder()

const publicKey = ref<string>(keyPair.publicKey.toString())
const sendMessage = ref<string>()
const transactionHash = ref<string>()


const handleSend = async () => {
  sendMessage.value = '送信中…'
  transactionHash.value = ''
  const deadline = facade.now().addHours(2)
  const messageBytes = textEncoder.encode('Hello, World!')
  const message = new Uint8Array(messageBytes.length + 1)
  message.set(new Uint8Array([0]), 0)
  message.set(messageBytes, 1)
  const transaction = facade.transactionFactory.create({
    type: 'transfer_transaction_v1',
    signerPublicKey: keyPair.publicKey.toString(),
    fee: BigInt('1000000'),
    deadline,
    recipientAddress: 'TARDV42KTAIZEF64EQT4NXT7K55DHWBEFIXVJQY',
    mosaics: [
      { mosaicId: BigInt('0x72C0212E67A08BCE'), amount: BigInt('1000000') },
    ],
    message
  })
  const signature = facade.signTransaction(keyPair, transaction)
  const jsonPayload = facade.transactionFactory.constructor.attachSignature(transaction, signature)
  const hash = facade.hashTransaction(transaction).toString()

  await fetch(`${NODE_URL}/transactions`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: jsonPayload
  })
  .then(res => res.json())
  .then(data => {
    sendMessage.value = data.message
    transactionHash.value = hash
  })
}
</script>