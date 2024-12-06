import { exposeToIframe, FrameHost  } from "@farcaster/frame-host";
import './style.css'

declare global {
  interface Window {
    ethereum: any;
  }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div style='position:relative;'>
    <div id="splash" style='position:absolute;top:0;left:0;width:100%;height:100%;background-color:#eeeeee;'></div>
    <iframe src="/frame/" id="frame" height="695" width="424" />
  </div>
`

const frameHost: FrameHost = {
  ready: () => {
    document.querySelector<HTMLDivElement>('#splash')!.hidden = true;
  }
} as FrameHost;

exposeToIframe({
 iframe: document.querySelector<HTMLIFrameElement>('#frame')!,
 sdk: frameHost,
 ethProvider: window.ethereum,
 frameOrigin: window.origin,
})
