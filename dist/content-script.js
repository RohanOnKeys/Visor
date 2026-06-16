function mt(e){const n=e.tagName.toLowerCase();if(["input","select","textarea","button"].includes(n))return!0;const r=e.getAttribute("role");return!!(r&&["button","checkbox","radio","combobox","textbox","link"].includes(r))}function Pt(e){if(e.hasAttribute("hidden")||e.getAttribute("aria-hidden")==="true")return!1;const n=window.getComputedStyle(e);if(n.display==="none"||n.visibility==="hidden"||parseFloat(n.opacity||"1")===0&&!mt(e))return!1;const r=e.getBoundingClientRect();return!(r.width===0&&r.height===0&&!mt(e))}function O(e){const n=bt(e);if(n)return n;if(e.hasAttribute("id")){const s=e.getAttribute("id");if(s&&/^[a-zA-Z0-9_-]+$/.test(s))return`#${s}`}const r=[];let l=e;for(;l&&l.nodeType===Node.ELEMENT_NODE;){const s=bt(l);let m=s||l.tagName.toLowerCase();const S=l.getAttribute("id");if(!s&&S&&/^[a-zA-Z0-9_-]+$/.test(S)){m=`#${S}`,r.unshift(m);break}const L=l.getAttribute("class");if(!s&&L){const x=L.trim().split(/\s+/).filter(y=>/^[a-zA-Z0-9_-]+$/.test(y))[0];x&&(m+=`.${x}`)}const E=l.parentElement;if(E&&!s){const x=Array.from(E.children),y=x.indexOf(l)+1;x.filter($=>$.tagName===l.tagName).length>1&&(m+=`:nth-child(${y})`)}if(r.unshift(m),s)break;l=l.parentElement}return r.join(" > ")}function bt(e){const n=e.tagName.toLowerCase(),r=["data-testid","data-test","data-cy","data-qa","data-track-id","aria-label"];for(const s of r){const m=e.getAttribute(s);if(m&&m.length<=80)return`${n}[${s}="${nt(m)}"]`}const l=e.getAttribute("role");if(l){const s=e.getAttribute("aria-label");return s&&s.length<=80?`${n}[role="${nt(l)}"][aria-label="${nt(s)}"]`:`${n}[role="${nt(l)}"]`}}function nt(e){return e.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function Nt(e){var ut,pt,ft,gt;const n=performance.now(),r=[],l=[],s=[],m=[],S=[],L=[],E=[],x=[],y=[];let M=0,$=0,H=0,b=0;const q=12e3;let I=!1;const X=new Map;function W(o){try{o.querySelectorAll("label").forEach(t=>{const c=t.getAttribute("for"),C=(t.textContent||"").trim().replace(/\s+/g," ");c&&C&&X.set(c,C)})}catch{}}W(document);const K=((ut=e.siteProfile)==null?void 0:ut.ignoreSelectors)||[],J=((pt=e.siteProfile)==null?void 0:pt.preserveSelectors)||[];function d(o,p){return p.some(t=>{try{return o.matches(t)}catch{return y.push({type:"other",message:"Invalid site profile selector ignored.",details:t}),!1}})}function a(o){return o.trim().replace(/\s+/g," ")}function k(o){let p="";for(let t=0;t<o.childNodes.length;t++){const c=o.childNodes[t];c.nodeType===Node.TEXT_NODE&&(p+=c.textContent)}return a(p)}function V(o,p){return["p","li","blockquote","td","span"].includes(p)||j(o)?a(o.textContent||""):k(o)}function j(o){const p=a(o.textContent||"");return p.length<4||p.length>700||o.querySelectorAll("article, section, div, table, form, ul, ol, nav, aside, header, footer").length>3?!1:o.querySelectorAll("a, span, strong, em, b, i, small, sup, sub").length>0}function rt(o){const p=o.getAttribute("aria-label"),t=o.getAttribute("title"),c=o.getAttribute("aria-labelledby"),C=c==null?void 0:c.split(/\s+/).map(D=>{var P;return((P=document.getElementById(D))==null?void 0:P.textContent)||""}).filter(Boolean).join(" "),w=a(o.textContent||""),h=o.value,T=o.getAttribute("name")||o.getAttribute("data-testid")||o.getAttribute("data-test")||o.getAttribute("data-cy");return a(C||p||t||w||h||T||"")}function st(o,p){const t=o.getAttribute("role"),c=`${p} ${t||""} ${o.getAttribute("class")||""} ${o.getAttribute("data-testid")||""}`.toLowerCase();return c.includes("dialog")||t==="dialog"?"dialog":c.includes("nav")||t==="navigation"||p==="nav"?"nav":c.includes("card")||c.includes("plan")||c.includes("tier")||c.includes("price")?"card":p==="ul"||p==="ol"||t==="list"?"list":p==="section"||p==="article"||t==="region"?"section":"generic"}function Ct(o,p){if(!["article","section","div","li","ul","ol","nav","aside"].includes(p))return!1;const t=a(o.textContent||"");if(t.length<20||t.length>1200)return!1;const c=`${p} ${o.getAttribute("role")||""} ${o.getAttribute("class")||""} ${o.getAttribute("data-testid")||""}`.toLowerCase(),C=o.querySelectorAll('button, a[href], img, video, svg, [role="button"], [aria-label]').length>0,w=/\b(plan|tier|price|premium|fan|mega|benefit|feature|subscription|monthly|yearly|\$\s?\d|\d+[.,]\d{2})\b/i.test(t+" "+c),h=o.querySelectorAll("article, section, div, li, table, form").length;return(C||w)&&h<=12}function Q(o,p){return o.filter(t=>t.selectorHint===p||t.selectorHint.startsWith(`${p} > `)).map(t=>t.id).slice(0,20)}function St(){return S.map(o=>({...o,childActionIds:Q(m,o.selectorHint),childMediaIds:Q(x,o.selectorHint)}))}function kt(o){const t=window.getComputedStyle(o).backgroundImage.match(/url\(["']?(.*?)["']?\)/);return t==null?void 0:t[1]}function lt(){return b++,b}function B(o){!o.text||S.some(p=>p.id===o.id)||S.push({...o,sourceOrder:o.sourceOrder||lt(),childActionIds:[],childMediaIds:[]})}function dt(){return/(^|\.)wikipedia\.org$/i.test(window.location.hostname)&&!!document.querySelector("#mw-content-text, .mw-parser-output")}function $t(){var P,U;if(!dt())return;const o=document.querySelector(".mw-parser-output");if(!o)return;y.push({type:"other",message:"Wikipedia semantic route applied: lead, TOC, infobox, sections, references, media, and nav are preserved as separate layout groups."});const p=a(((P=document.querySelector("#firstHeading"))==null?void 0:P.textContent)||document.title),t=[];for(const i of Array.from(o.children)){if(i.matches("h2, .mw-heading2, #toc, .vector-toc, table.infobox"))break;if(i.matches("p")){const u=a(i.textContent||"");u.length>40&&t.push(u)}}t.length>0&&B({id:"wikipedia-lead",label:`${p} lead`,role:"lead",text:t.join(`

`),selectorHint:".mw-parser-output > p"});const c=document.querySelector('#toc, .vector-toc, [aria-label="Contents"]');if(c){const i=Array.from(c.querySelectorAll("a")).map(u=>a(u.textContent||"")).filter(Boolean).slice(0,80);B({id:"wikipedia-toc",label:"Table of contents",role:"toc",text:i.join(`
`),selectorHint:O(c)})}const C=o.querySelector("table.infobox");if(C){const i=a(C.textContent||"");B({id:"wikipedia-infobox",label:a(((U=C.querySelector("caption, th"))==null?void 0:U.textContent)||`${p} infobox`),role:"infobox",text:i,selectorHint:O(C)})}Array.from(o.querySelectorAll("h2, .mw-heading2")).forEach((i,u)=>{const f=a(i.textContent||"").replace(/\[edit\]$/i,"").trim();if(!f)return;const g=[];let v=i.nextElementSibling;for(;v&&!v.matches("h2, .mw-heading2");){if(v.matches("p, ul, ol, table, figure, .thumb, .reflist, ol.references")){const A=a(v.textContent||"");A.length>20&&g.push(A)}v=v.nextElementSibling}g.length>0&&B({id:`wikipedia-section-${u+1}`,label:f,role:/references|notes|bibliography|external links/i.test(f)?"references":"article_section",text:g.join(`

`).slice(0,6e3),selectorHint:O(i)})});const h=o.querySelector('.reflist, ol.references, section[aria-labelledby="References"]');if(h){const i=Array.from(h.querySelectorAll("li, cite")).map(u=>a(u.textContent||"")).filter(u=>u.length>10).slice(0,80);B({id:"wikipedia-references",label:"References",role:"references",text:i.join(`
`),selectorHint:O(h)})}const T=document.querySelector("#p-navigation, .vector-page-toolbar, nav[aria-label]");if(T){const i=Array.from(T.querySelectorAll("a, button")).map(u=>a(u.textContent||u.getAttribute("aria-label")||"")).filter(Boolean).slice(0,60).join(`
`);B({id:"wikipedia-nav",label:"Page navigation",role:"nav",text:i,selectorHint:O(T)})}const D=new Set(x.map(i=>`${i.src||""}:${i.alt||""}`));o.querySelectorAll("figure, .thumb, .mw-file-description").forEach((i,u)=>{var Y;const f=i.querySelector("img"),g=(f==null?void 0:f.currentSrc)||(f==null?void 0:f.getAttribute("src"))||(f==null?void 0:f.getAttribute("srcset"))||void 0,v=(f==null?void 0:f.getAttribute("alt"))||void 0,A=a(((Y=i.querySelector("figcaption, .thumbcaption"))==null?void 0:Y.textContent)||(f==null?void 0:f.getAttribute("title"))||""),G=`${g||""}:${v||A}`;if(!g||D.has(G))return;D.add(G);const R=lt(),N=O(i),ot=`wikipedia-media-${u+1}`;x.push({id:ot,type:"image",alt:v,caption:A||void 0,src:g,selectorHint:N,sourceOrder:R}),B({id:`${ot}-group`,label:A||v||"Wikipedia media",role:"media",text:A||v||g,selectorHint:N,sourceOrder:R})})}function Lt(){if(r.length!==0)return r[r.length-1].id}function F(o,p){var D,P,U;if(I)return;if(M++,M>q){I||(I=!0,y.push({type:"node_limit",message:`Page size limit exceeded (processed over ${q} nodes). Extraction has been capped.`,details:`Processed nodes: ${M}`}));return}if(o.nodeType!==Node.ELEMENT_NODE){o.childNodes.forEach(i=>F(i,p));return}const t=o,c=t.tagName.toLowerCase(),C=d(t,J);if(["script","style","noscript","template","head","meta","link","title"].includes(c)){H++;return}if(!C&&d(t,K)){H++;return}if(!C&&!Pt(t)){H++;return}$++,b++;const w=t.getAttribute("id")||`visor-el-${b}`,h=O(t);if(Ct(t,c)){const i=a(t.textContent||""),u=t.getAttribute("aria-label")||t.getAttribute("title")||"",f=a(((D=t.querySelector("h1, h2, h3, h4, h5, h6"))==null?void 0:D.textContent)||""),g=i.split(new RegExp("(?<=[.!?])\\s+"))[0]||i;S.push({id:`${w}-group`,label:a(u||f||g.slice(0,80)),role:st(t,c),text:i,selectorHint:h,sourceOrder:b,childActionIds:Q(m,h),childMediaIds:Q(x,h)})}const T=c.match(/^h([1-6])$/);if(T){const i=parseInt(T[1]),u=a(t.textContent||"");if(u){const f={id:w,text:u,level:i,selectorHint:h,sourceOrder:b};r.push(f),p=w}}else if(c==="pre"||c==="code"){if(!(c==="code"&&((P=t.parentElement)==null?void 0:P.tagName.toLowerCase())==="pre")){const i=t.textContent||"";i.trim()&&l.push({id:w,text:i,selectorHint:h,sourceOrder:b,parentHeadingId:p});return}}else if(c==="table"){const i=[],u=[];let f;const g=t.querySelector("caption");g&&(f=a(g.textContent||"")),t.querySelectorAll("th").forEach(v=>{const A=a(v.textContent||"");A&&i.push(A)}),t.querySelectorAll("tr").forEach(v=>{const A=[];v.querySelectorAll("th, td").forEach(G=>{const R=a(G.textContent||"");R&&A.push(R)}),A.length>0&&u.push(A)}),E.push({id:w,caption:f,headers:i,rows:u,selectorHint:h,sourceOrder:b});return}else if(["img","video","audio","canvas","svg"].includes(c)){const i=c==="img"||c==="svg"?"image":c,u=t,f=t.getAttribute("alt")||t.getAttribute("aria-label")||void 0,g=u.currentSrc||t.getAttribute("src")||t.getAttribute("data-src")||t.getAttribute("srcset")||t.getAttribute("data-srcset")||void 0,v=t.getAttribute("title")||void 0;x.push({id:w,type:i,alt:f,caption:v,src:g,selectorHint:h,sourceOrder:b}),c==="canvas"&&y.push({type:"canvas_only",message:"Page contains a Canvas element. Graphic contents inside Canvas are unreadable as HTML DOM."})}else if(c==="form"){const i=[],u=[];t.querySelectorAll("input, select, textarea, button").forEach((g,v)=>{const A=g.getAttribute("id")||`form-ctrl-${b}-${v}`,G=g.getAttribute("name")||void 0,R=g.tagName.toLowerCase(),N=g.getAttribute("type")||"text",ot=g.hasAttribute("required"),Y=g.hasAttribute("disabled"),Tt=g.getAttribute("placeholder")||void 0;let z=X.get(g.getAttribute("id")||"")||void 0;if(!z){const _=g.closest("label");_&&(z=a(_.textContent||""))}if(z||(z=g.getAttribute("aria-label")||g.getAttribute("title")||void 0),R==="button"||["submit","button","image","reset"].includes(N)){const _=z||a(g.textContent||"")||N;u.push({id:A,type:"button",label:_,selectorHint:O(g),textContext:a(g.textContent||""),disabled:Y,sourceOrder:b})}else{let _=g.value||void 0;(N==="password"||N==="one-time-code"||g.getAttribute("autocomplete")==="one-time-code")&&(_=void 0),i.push({id:A,name:G,type:N,label:z,placeholder:Tt,required:ot,disabled:Y,value:_})}}),L.push({id:w,selectorHint:h,label:t.getAttribute("aria-label")||t.getAttribute("name")||void 0,fields:i,submitControls:u,sourceOrder:b})}else if(c==="button"||t.getAttribute("role")==="button"||c==="input"&&["button","submit","image"].includes(t.getAttribute("type")||"")){const i="button",u=rt(t)||"Button",f=t.hasAttribute("disabled");m.push({id:w,type:i,label:u,selectorHint:h,textContext:a(t.textContent||""),disabled:f,sourceOrder:b})}else if(c==="a"&&t.hasAttribute("href")){const i=t.getAttribute("href")||"",u=a(t.textContent||""),f=t.getAttribute("title")||void 0,g=t.getAttribute("rel")||void 0;t.getAttribute("role")==="button"?m.push({id:w,type:"button",label:u||f||"Link Button",selectorHint:h,textContext:u,sourceOrder:b}):s.push({id:w,text:u||i,href:i,title:f,rel:g,selectorHint:h,sourceOrder:b})}else if(["p","span","li","article","section","div","td","blockquote"].includes(c)){const i=V(t,c);i.length>3&&l.push({id:w,text:i,selectorHint:h,sourceOrder:b,parentHeadingId:p||Lt()});const u=kt(t);u&&x.push({id:`${w}-background`,type:"image",alt:t.getAttribute("aria-label")||void 0,caption:t.getAttribute("title")||void 0,src:u,selectorHint:h,sourceOrder:b})}if(t.shadowRoot&&(y.push({type:"shadow_dom",message:"Shadow DOM encountered and traversed."}),W(t.shadowRoot),t.shadowRoot.childNodes.forEach(i=>F(i,p))),c==="iframe")try{const i=t,u=i.contentDocument||((U=i.contentWindow)==null?void 0:U.document);u?(W(u),u.childNodes.forEach(f=>F(f,p))):y.push({type:"iframe",message:"Cross-origin iframe detected. Content is restricted due to browser same-origin policies.",details:`Source: ${i.src||"about:blank"}`})}catch(i){y.push({type:"iframe",message:"Iframe access blocked. Same-origin validation failed.",details:i.message||i})}t.childNodes.forEach(i=>F(i,p))}let tt=document.body;const et=(ft=e.siteProfile)==null?void 0:ft.mainContentSelector;if(et)try{tt=document.querySelector(et)||document.body,tt===document.body&&y.push({type:"other",message:"Site profile main content selector did not match. Falling back to document body.",details:et})}catch{y.push({type:"other",message:"Invalid site profile main content selector. Falling back to document body.",details:et})}tt&&F(tt),$t();const Mt=performance.now()-n;return{schemaVersion:"page_snapshot.v1",source:{url:window.location.href,canonicalUrl:((gt=document.querySelector('link[rel="canonical"]'))==null?void 0:gt.getAttribute("href"))||void 0,title:document.title,capturedAt:new Date().toISOString(),language:document.documentElement.lang||void 0},metadata:{generator:"Visor DOM Extractor v0.1.0",userAgent:navigator.userAgent,semanticRoute:dt()?"wikipedia_article":"generic"},headings:r,textBlocks:l,links:s,actions:m,layoutGroups:St(),forms:L,tables:E,media:x,stats:{totalNodes:M,extractedNodes:$,ignoredNodes:H,timeElapsedMs:Mt},warnings:y}}const ct="pendingAgentExport",Ot=5*60*1e3,qt=25*1e3,It=500,ht={chatgpt:["chatgpt.com","chat.openai.com"],grok:["grok.com"],gemini:["gemini.google.com"],claude:["claude.ai"]},Bt=["textarea:not([disabled])",'[contenteditable="true"]','[role="textbox"]',".ProseMirror"];function yt(e){const n=e.toLowerCase();return Object.keys(ht).find(r=>ht[r].some(l=>n===l||n.endsWith(`.${l}`)))}function Dt(e,n=Date.now()){const r=Date.parse(e.createdAt);return Number.isFinite(r)&&n-r<=Ot}function Rt(e){const n=e.getBoundingClientRect(),r=window.getComputedStyle(e);return n.width>0&&n.height>0&&r.display!=="none"&&r.visibility!=="hidden"}function _t(e=document){for(const n of Bt){const l=Array.from(e.querySelectorAll(n)).find(s=>Rt(s)?s instanceof HTMLTextAreaElement?!s.disabled&&!s.readOnly:s.isContentEditable||s.getAttribute("role")==="textbox":!1);if(l)return l}return null}function vt(e){e.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText"})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function Ht(e,n){var m;if(e.focus(),e instanceof HTMLTextAreaElement||e instanceof HTMLInputElement)return e.value=n,vt(e),e.value===n;const r=window.getSelection(),l=document.createRange();return l.selectNodeContents(e),l.collapse(!1),r==null||r.removeAllRanges(),r==null||r.addRange(l),(!document.execCommand("insertText",!1,n)||((m=e.textContent)==null?void 0:m.trim())!==n.trim())&&(e.textContent=n),vt(e),(e.textContent||"").trim()===n.trim()}function Wt(){return new Promise(e=>{chrome.storage.local.get([ct],n=>{e(n[ct])})})}function Vt(){return chrome.storage.local.remove(ct)}function jt(e){return new Promise(n=>window.setTimeout(n,e))}async function Gt(){const e=yt(window.location.hostname);if(!e)return;const n=await Wt();if(!n||n.provider!==e||!Dt(n))return;const r=Date.now();for(;Date.now()-r<=qt;){const l=_t();if(l&&Ht(l,n.text)){await Vt(),console.info(`Visor inserted context into ${e}. Review it before sending.`);return}await jt(It)}}const it={chatgpt:"GPT",grok:"Grok",gemini:"Gemini",claude:"Claude"},zt={chatgpt:"llm-chatgpt.png",grok:"llm-grok.png",gemini:"llm-gemini.png",claude:"llm-claude.png"};let Z;function wt(){return chrome.storage.session}async function at(e){const n=wt();if(n)return new Promise(r=>{n.get([e],l=>{if(chrome.runtime.lastError){r(void 0);return}r(l[e])})})}async function xt(e,n){const r=wt();if(r)return new Promise(l=>{r.set({[e]:n},()=>l())})}function Xt(){return window.top!==window.self||yt(window.location.hostname)||document.documentElement.dataset.visorWidgetMounted==="true"?!1:!/^chrome:|^chrome-extension:|^about:|^devtools:/i.test(window.location.href)}function Ft(e,n){return new Promise(r=>{chrome.runtime.sendMessage({type:"VISOR_EXPORT_ACTIVE_TAB_TO_AGENT",payload:{provider:e,request:n}},l=>{if(chrome.runtime.lastError){r({ok:!1,userMessage:chrome.runtime.lastError.message||"Export failed."});return}r(l||{ok:!1,userMessage:"Export failed."})})})}function Ut(){const e=document.createElement("style");return e.textContent=`
    :host {
      all: initial;
      color-scheme: dark;
      --visor-green: #1ed760;
      --visor-border: rgba(30, 215, 96, 0.38);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .visor-widget {
      position: fixed;
      right: 18px;
      bottom: 18px;
      width: 46px;
      height: 46px;
      z-index: 2147483647;
      pointer-events: auto;
    }

    .visor-main,
    .visor-action,
    .visor-close {
      position: absolute;
      border: 1px solid var(--visor-border);
      border-radius: 999px;
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      display: grid;
      place-items: center;
      line-height: 0;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.32), 0 0 18px rgba(30, 215, 96, 0.14);
      transition: transform 180ms ease, border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      transform-origin: center;
    }

    .visor-main {
      inset: 0;
      border-color: transparent;
      background: transparent;
      box-shadow: none;
      touch-action: none;
    }

    .visor-main:hover,
    .visor-action:hover,
    .visor-close:hover {
      border-color: rgba(30, 215, 96, 0.88);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.36), 0 0 22px rgba(30, 215, 96, 0.22);
    }

    .visor-main img {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      object-fit: cover;
      object-position: center;
      filter: saturate(1.18) contrast(1.06);
      pointer-events: none;
    }

    .visor-actions {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 140ms ease;
    }

    .visor-widget.open .visor-actions {
      opacity: 1;
      pointer-events: auto;
    }

    .visor-action {
      width: 34px;
      height: 34px;
      left: 6px;
      top: 6px;
      background: rgba(4, 10, 8, 0.56);
      backdrop-filter: blur(8px);
      transform: translate(0, 0) scale(0.72);
    }

    .visor-widget.open .visor-action {
      transform: translate(var(--x), var(--y)) scale(0.92);
    }

    .visor-close {
      width: 24px;
      height: 24px;
      left: 11px;
      top: 11px;
      background: var(--visor-green);
      opacity: 0;
      pointer-events: none;
      transform: translate(var(--close-x, 0), var(--close-y, -88px)) scale(0.7);
    }

    .visor-close::before,
    .visor-close::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      width: 12px;
      height: 2px;
      border-radius: 999px;
      background: #001409;
      transform-origin: center;
    }

    .visor-close::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    .visor-close::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }

    .visor-widget.open .visor-close {
      opacity: 1;
      pointer-events: auto;
      transform: translate(var(--close-x, 0), var(--close-y, -88px)) scale(1);
    }

    .visor-widget.open .visor-actions:hover .visor-action {
      transform: translate(calc(var(--x) * 0.82), calc(var(--y) * 0.82)) scale(0.74);
      opacity: 0.78;
    }

    .visor-widget.open .visor-actions:hover .visor-action:hover {
      transform: translate(calc(var(--x) * 0.92), calc(var(--y) * 0.92)) scale(1.18);
      opacity: 1;
      z-index: 2;
    }

    .visor-action img {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 999px;
      object-fit: cover;
      object-position: center;
      pointer-events: none;
    }

    .visor-action[disabled] {
      cursor: wait;
      opacity: 0.62;
    }

    .visor-widget.dragging .visor-main {
      cursor: grabbing;
    }
  `,e}async function At(){Z==null||Z.remove(),Z=void 0,delete document.documentElement.dataset.visorWidgetMounted}async function Et(){if(!Xt())return;const e=await at("settings")||{};if(e.widgetEnabled===!1)return;document.documentElement.dataset.visorWidgetMounted="true";const n={open:!1,mode:e.defaultMode||"agent_action",privacyLevel:e.privacyLevel||"medium",tokenBudget:e.tokenBudget||4e3},r=document.createElement("div");r.id="visor-floating-widget-root",Z=r;const l=r.attachShadow({mode:"open"}),s=document.createElement("div");s.className="visor-widget";const m=document.createElement("button");m.className="visor-main",m.type="button",m.title="Open Visor agent export widget",m.setAttribute("aria-label","Open Visor agent export widget");const S=document.createElement("img");S.src=chrome.runtime.getURL("visor-logo.png"),S.alt="",m.appendChild(S);const L=document.createElement("div");L.className="visor-actions";const E=document.createElement("button");E.className="visor-close",E.type="button",E.title="Hide Visor widget",E.setAttribute("aria-label","Hide Visor widget"),E.addEventListener("click",async d=>{d.stopPropagation();const a=await at("settings")||{};await xt("settings",{...a,widgetEnabled:!1}),await At()});const x={chatgpt:[-40,-2],grok:[-34,-38],gemini:[0,-54],claude:[34,-38]},y=new Map,M=()=>{const d=s.getBoundingClientRect(),a=d.left<76?-1:1,k=d.top<76?-1:1;E.style.setProperty("--close-x","0px"),E.style.setProperty("--close-y",`${-88*k}px`),y.forEach((V,j)=>{const[rt,st]=x[j];V.style.setProperty("--x",`${rt*a}px`),V.style.setProperty("--y",`${st*k}px`)})};Object.keys(it).forEach(d=>{const a=document.createElement("button");a.className="visor-action",a.type="button",a.title=`Dump current page context to ${it[d]}`,a.setAttribute("aria-label",`Dump current page context to ${it[d]}`),a.style.setProperty("--x",`${x[d][0]}px`),a.style.setProperty("--y",`${x[d][1]}px`),y.set(d,a);const k=document.createElement("img");k.src=chrome.runtime.getURL(zt[d]),k.alt="",a.appendChild(k),a.addEventListener("click",async V=>{V.stopPropagation(),n.exporting=d,$();const j=await Ft(d,{mode:n.mode,privacyLevel:n.privacyLevel,tokenBudget:n.tokenBudget});n.exporting=void 0,a.title=j.ok?`Opened ${it[d]}`:j.userMessage||"Export failed",$()}),L.appendChild(a)});function $(){M(),s.classList.toggle("open",n.open),L.querySelectorAll(".visor-action").forEach(d=>{d.disabled=!!n.exporting})}const H=async()=>{const d=await at("visorWidgetPosition");if(typeof(d==null?void 0:d.left)!="number"||typeof(d==null?void 0:d.top)!="number")return;const a=Math.min(Math.max(8,d.left),Math.max(8,window.innerWidth-54)),k=Math.min(Math.max(8,d.top),Math.max(8,window.innerHeight-54));s.style.left=`${a}px`,s.style.top=`${k}px`,s.style.right="auto",s.style.bottom="auto",M()};let b,q=!1,I=!1,X=0,W=0;const K=async()=>{if(b&&(window.clearTimeout(b),b=void 0),!q)return;q=!1,s.classList.remove("dragging");const d=s.getBoundingClientRect();await xt("visorWidgetPosition",{left:d.left,top:d.top})};m.addEventListener("pointerdown",d=>{if(d.button!==0)return;const a=s.getBoundingClientRect();X=d.clientX-a.left,W=d.clientY-a.top,b=window.setTimeout(()=>{q=!0,I=!0,n.open=!1,s.classList.add("dragging"),$(),m.setPointerCapture(d.pointerId)},260)}),m.addEventListener("pointermove",d=>{if(!q)return;const a=Math.min(Math.max(8,d.clientX-X),Math.max(8,window.innerWidth-s.offsetWidth-8)),k=Math.min(Math.max(8,d.clientY-W),Math.max(8,window.innerHeight-s.offsetHeight-8));s.style.left=`${a}px`,s.style.top=`${k}px`,s.style.right="auto",s.style.bottom="auto",M()}),m.addEventListener("pointerup",()=>{K()}),m.addEventListener("pointercancel",()=>{K()}),m.addEventListener("click",d=>{if(d.stopPropagation(),I){I=!1;return}n.open=!n.open,$()}),document.addEventListener("keydown",d=>{d.key==="Escape"&&n.open&&(n.open=!1,$())}),l.append(Ut(),s),s.append(L,E,m),$(),H();const J=()=>{document.body.contains(r)||document.body.appendChild(r)};document.body?J():window.addEventListener("DOMContentLoaded",J,{once:!0})}Gt();Et();chrome.runtime.onMessage.addListener((e,n,r)=>{var l;if(e.type==="VISOR_EXTRACT_DOM")try{const s=e.payload.settings,m=Nt(s);r({ok:!0,snapshot:m})}catch(s){console.error("Visor content script extraction failed:",s),r({ok:!1,error:s.message||s})}return e.type==="VISOR_WIDGET_SET_ENABLED"&&(!!((l=e.payload)!=null&&l.enabled)?Et():At()).then(()=>{r({ok:!0})}),!0});console.log("Visor Content Script Active");
