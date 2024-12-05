import { sdk } from "@farcaster/frame-sdk";

setTimeout(() => {
  sdk.actions.ready();

  document.querySelector<HTMLDivElement>('#sign')!.onclick = () => {
    sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' })
      .then((addresses) => {
        return sdk.wallet.ethProvider.request({ 
          method: 'personal_sign', 
          params: ["0x48656c6c6f2066726f6d2056616e696c6c61204672616d65", addresses[0]] 
        })
      })
      .then((signature) => {
        alert("You signed:\n" + signature);
      });
  }
}, 750);

sdk.wallet.ethProvider.on("chainChanged", (chainId) => {
  console.log("Chain changed", chainId);
});
