function v(r){const e=new URL(r);return e.hash="",e.toString()}function w(r){const e=new URL(r);return`${e.hostname}${e.pathname}`}const g="bkmk-tldraw-root",_="bkmk-tldraw-wrapper",R=36,x="__BKMK_TLDRAW_CONTENT_SCRIPT__";window[x]||(window[x]=!0,C());function C(){let r=null,e=null;function b(){const o=new URLSearchParams({pageKey:v(window.location.href),pageLabel:w(window.location.href),pageUrl:window.location.href});return`${chrome.runtime.getURL("overlay.html")}?${o.toString()}`}function l(o,a,p){return Math.min(Math.max(o,a),p)}function y(){const o=document.getElementById(g);if(o)return o;const a=document.createElement("div");a.id=g;const p=a.attachShadow({mode:"open"}),m=document.createElement("style");m.textContent=`
    :host {
      all: initial;
    }

    .wrapper {
      position: fixed;
      top: 16px;
      right: 16px;
      width: max(360px, 25vw);
      height: max(260px, 25vh);
      min-width: 320px;
      min-height: 220px;
      max-width: min(90vw, 960px);
      max-height: min(90vh, 900px);
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(15, 23, 42, 0.18);
      border-radius: 14px;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.28);
      overflow: hidden;
      backdrop-filter: blur(10px);
      color: #0f172a;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }

    .toolbar {
      height: ${R}px;
      padding: 0 10px;
      background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
      border-bottom: 1px solid rgba(15, 23, 42, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
      user-select: none;
    }

    .toolbar:active {
      cursor: grabbing;
    }

    .title {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 75%;
    }

    .close {
      border: 0;
      background: transparent;
      color: #334155;
      font-size: 18px;
      line-height: 1;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      cursor: pointer;
    }

    .close:hover {
      background: rgba(15, 23, 42, 0.08);
    }

    iframe {
      flex: 1;
      width: 100%;
      border: 0;
      background: #ffffff;
    }

    .resize {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 18px;
      height: 18px;
      cursor: nwse-resize;
      background:
        linear-gradient(135deg, transparent 0 50%, rgba(15, 23, 42, 0.22) 50% 60%, transparent 60% 100%),
        linear-gradient(135deg, transparent 0 68%, rgba(15, 23, 42, 0.22) 68% 78%, transparent 78% 100%);
    }
    `;const n=document.createElement("div");n.id=_,n.className="wrapper";const i=document.createElement("div");i.className="toolbar";const u=document.createElement("div");u.className="title",u.textContent=`TLDraw • ${w(window.location.href)}`;const d=document.createElement("button");d.className="close",d.type="button",d.textContent="×",d.title="Close overlay",d.addEventListener("click",()=>a.remove()),i.append(u,d);const c=document.createElement("iframe");c.src=b(),c.title="TLDraw overlay",c.allow="clipboard-read; clipboard-write";const s=document.createElement("div");return s.className="resize",i.addEventListener("pointerdown",t=>{t.target!==d&&(r={pointerId:t.pointerId,offsetX:t.clientX-n.getBoundingClientRect().left,offsetY:t.clientY-n.getBoundingClientRect().top},i.setPointerCapture(t.pointerId))}),i.addEventListener("pointermove",t=>{if(!r||r.pointerId!==t.pointerId)return;const f=n.offsetWidth,h=n.offsetHeight,E=l(t.clientX-r.offsetX,0,window.innerWidth-f),L=l(t.clientY-r.offsetY,0,window.innerHeight-h);n.style.left=`${E}px`,n.style.top=`${L}px`,n.style.right="auto"}),i.addEventListener("pointerup",t=>{!r||r.pointerId!==t.pointerId||(r=null,i.releasePointerCapture(t.pointerId))}),s.addEventListener("pointerdown",t=>{e={pointerId:t.pointerId,startX:t.clientX,startY:t.clientY,startWidth:n.offsetWidth,startHeight:n.offsetHeight},s.setPointerCapture(t.pointerId),t.stopPropagation()}),s.addEventListener("pointermove",t=>{if(!e||e.pointerId!==t.pointerId)return;const f=l(e.startWidth+(t.clientX-e.startX),320,Math.floor(window.innerWidth*.9)),h=l(e.startHeight+(t.clientY-e.startY),220,Math.floor(window.innerHeight*.9));n.style.width=`${f}px`,n.style.height=`${h}px`}),s.addEventListener("pointerup",t=>{!e||e.pointerId!==t.pointerId||(e=null,s.releasePointerCapture(t.pointerId))}),p.append(m,n),n.append(i,c,s),document.documentElement.append(a),a}function I(){const o=document.getElementById(g);if(o){o.remove();return}y()}chrome.runtime.onMessage.addListener(o=>{o?.type!=="BKMK_TLDRAW_PING"&&o?.type==="BKMK_TLDRAW_TOGGLE"&&I()})}
