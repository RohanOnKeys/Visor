function st(e){const r=e.tagName.toLowerCase();if(["input","select","textarea","button"].includes(r))return!0;const i=e.getAttribute("role");return!!(i&&["button","checkbox","radio","combobox","textbox","link"].includes(i))}function St(e){if(e.hasAttribute("hidden")||e.getAttribute("aria-hidden")==="true")return!1;const r=window.getComputedStyle(e);if(r.display==="none"||r.visibility==="hidden"||parseFloat(r.opacity||"1")===0&&!st(e))return!1;const i=e.getBoundingClientRect();return!(i.width===0&&i.height===0&&!st(e))}function q(e){const r=at(e);if(r)return r;if(e.hasAttribute("id")){const p=e.getAttribute("id");if(p&&/^[a-zA-Z0-9_-]+$/.test(p))return`#${p}`}const i=[];let s=e;for(;s&&s.nodeType===Node.ELEMENT_NODE;){const p=at(s);let g=p||s.tagName.toLowerCase();const w=s.getAttribute("id");if(!p&&w&&/^[a-zA-Z0-9_-]+$/.test(w)){g=`#${w}`,i.unshift(g);break}const $=s.getAttribute("class");if(!p&&$){const C=$.trim().split(/\s+/).filter(h=>/^[a-zA-Z0-9_-]+$/.test(h))[0];C&&(g+=`.${C}`)}const k=s.parentElement;if(k&&!p){const C=Array.from(k.children),h=C.indexOf(s)+1;C.filter(x=>x.tagName===s.tagName).length>1&&(g+=`:nth-child(${h})`)}if(i.unshift(g),p)break;s=s.parentElement}return i.join(" > ")}function at(e){const r=e.tagName.toLowerCase(),i=["data-testid","data-test","data-cy","data-qa","data-track-id","aria-label"];for(const p of i){const g=e.getAttribute(p);if(g&&g.length<=80)return`${r}[${p}="${X(g)}"]`}const s=e.getAttribute("role");if(s){const p=e.getAttribute("aria-label");return p&&p.length<=80?`${r}[role="${X(s)}"][aria-label="${X(p)}"]`:`${r}[role="${X(s)}"]`}}function X(e){return e.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function kt(e){var ot,nt,it,rt;const r=performance.now(),i=[],s=[],p=[],g=[],w=[],$=[],k=[],C=[],h=[];let L=0,x=0,E=0,m=0;const W=12e3;let _=!1;const Q=new Map;function K(o){try{o.querySelectorAll("label").forEach(t=>{const a=t.getAttribute("for"),S=(t.textContent||"").trim().replace(/\s+/g," ");a&&S&&Q.set(a,S)})}catch{}}K(document);const ut=((ot=e.siteProfile)==null?void 0:ot.ignoreSelectors)||[],pt=((nt=e.siteProfile)==null?void 0:nt.preserveSelectors)||[];function Y(o,l){return l.some(t=>{try{return o.matches(t)}catch{return h.push({type:"other",message:"Invalid site profile selector ignored.",details:t}),!1}})}function f(o){return o.trim().replace(/\s+/g," ")}function ft(o){let l="";for(let t=0;t<o.childNodes.length;t++){const a=o.childNodes[t];a.nodeType===Node.TEXT_NODE&&(l+=a.textContent)}return f(l)}function gt(o,l){return["p","li","blockquote","td","span"].includes(l)||mt(o)?f(o.textContent||""):ft(o)}function mt(o){const l=f(o.textContent||"");return l.length<4||l.length>700||o.querySelectorAll("article, section, div, table, form, ul, ol, nav, aside, header, footer").length>3?!1:o.querySelectorAll("a, span, strong, em, b, i, small, sup, sub").length>0}function bt(o){const l=o.getAttribute("aria-label"),t=o.getAttribute("title"),a=o.getAttribute("aria-labelledby"),S=a==null?void 0:a.split(/\s+/).map(O=>{var M;return((M=document.getElementById(O))==null?void 0:M.textContent)||""}).filter(Boolean).join(" "),y=f(o.textContent||""),b=o.value,T=o.getAttribute("name")||o.getAttribute("data-testid")||o.getAttribute("data-test")||o.getAttribute("data-cy");return f(S||l||t||y||b||T||"")}function ht(o,l){const t=o.getAttribute("role"),a=`${l} ${t||""} ${o.getAttribute("class")||""} ${o.getAttribute("data-testid")||""}`.toLowerCase();return a.includes("dialog")||t==="dialog"?"dialog":a.includes("nav")||t==="navigation"||l==="nav"?"nav":a.includes("card")||a.includes("plan")||a.includes("tier")||a.includes("price")?"card":l==="ul"||l==="ol"||t==="list"?"list":l==="section"||l==="article"||t==="region"?"section":"generic"}function xt(o,l){if(!["article","section","div","li","ul","ol","nav","aside"].includes(l))return!1;const t=f(o.textContent||"");if(t.length<20||t.length>1200)return!1;const a=`${l} ${o.getAttribute("role")||""} ${o.getAttribute("class")||""} ${o.getAttribute("data-testid")||""}`.toLowerCase(),S=o.querySelectorAll('button, a[href], img, video, svg, [role="button"], [aria-label]').length>0,y=/\b(plan|tier|price|premium|fan|mega|benefit|feature|subscription|monthly|yearly|\$\s?\d|\d+[.,]\d{2})\b/i.test(t+" "+a),b=o.querySelectorAll("article, section, div, li, table, form").length;return(S||y)&&b<=12}function G(o,l){return o.filter(t=>t.selectorHint===l||t.selectorHint.startsWith(`${l} > `)).map(t=>t.id).slice(0,20)}function vt(){return w.map(o=>({...o,childActionIds:G(g,o.selectorHint),childMediaIds:G(C,o.selectorHint)}))}function yt(o){const t=window.getComputedStyle(o).backgroundImage.match(/url\(["']?(.*?)["']?\)/);return t==null?void 0:t[1]}function tt(){return m++,m}function P(o){!o.text||w.some(l=>l.id===o.id)||w.push({...o,sourceOrder:o.sourceOrder||tt(),childActionIds:[],childMediaIds:[]})}function et(){return/(^|\.)wikipedia\.org$/i.test(window.location.hostname)&&!!document.querySelector("#mw-content-text, .mw-parser-output")}function At(){var M,j;if(!et())return;const o=document.querySelector(".mw-parser-output");if(!o)return;h.push({type:"other",message:"Wikipedia semantic route applied: lead, TOC, infobox, sections, references, media, and nav are preserved as separate layout groups."});const l=f(((M=document.querySelector("#firstHeading"))==null?void 0:M.textContent)||document.title),t=[];for(const n of Array.from(o.children)){if(n.matches("h2, .mw-heading2, #toc, .vector-toc, table.infobox"))break;if(n.matches("p")){const c=f(n.textContent||"");c.length>40&&t.push(c)}}t.length>0&&P({id:"wikipedia-lead",label:`${l} lead`,role:"lead",text:t.join(`

`),selectorHint:".mw-parser-output > p"});const a=document.querySelector('#toc, .vector-toc, [aria-label="Contents"]');if(a){const n=Array.from(a.querySelectorAll("a")).map(c=>f(c.textContent||"")).filter(Boolean).slice(0,80);P({id:"wikipedia-toc",label:"Table of contents",role:"toc",text:n.join(`
`),selectorHint:q(a)})}const S=o.querySelector("table.infobox");if(S){const n=f(S.textContent||"");P({id:"wikipedia-infobox",label:f(((j=S.querySelector("caption, th"))==null?void 0:j.textContent)||`${l} infobox`),role:"infobox",text:n,selectorHint:q(S)})}Array.from(o.querySelectorAll("h2, .mw-heading2")).forEach((n,c)=>{const d=f(n.textContent||"").replace(/\[edit\]$/i,"").trim();if(!d)return;const u=[];let v=n.nextElementSibling;for(;v&&!v.matches("h2, .mw-heading2");){if(v.matches("p, ul, ol, table, figure, .thumb, .reflist, ol.references")){const A=f(v.textContent||"");A.length>20&&u.push(A)}v=v.nextElementSibling}u.length>0&&P({id:`wikipedia-section-${c+1}`,label:d,role:/references|notes|bibliography|external links/i.test(d)?"references":"article_section",text:u.join(`

`).slice(0,6e3),selectorHint:q(n)})});const b=o.querySelector('.reflist, ol.references, section[aria-labelledby="References"]');if(b){const n=Array.from(b.querySelectorAll("li, cite")).map(c=>f(c.textContent||"")).filter(c=>c.length>10).slice(0,80);P({id:"wikipedia-references",label:"References",role:"references",text:n.join(`
`),selectorHint:q(b)})}const T=document.querySelector("#p-navigation, .vector-page-toolbar, nav[aria-label]");if(T){const n=Array.from(T.querySelectorAll("a, button")).map(c=>f(c.textContent||c.getAttribute("aria-label")||"")).filter(Boolean).slice(0,60).join(`
`);P({id:"wikipedia-nav",label:"Page navigation",role:"nav",text:n,selectorHint:q(T)})}const O=new Set(C.map(n=>`${n.src||""}:${n.alt||""}`));o.querySelectorAll("figure, .thumb, .mw-file-description").forEach((n,c)=>{var V;const d=n.querySelector("img"),u=(d==null?void 0:d.currentSrc)||(d==null?void 0:d.getAttribute("src"))||(d==null?void 0:d.getAttribute("srcset"))||void 0,v=(d==null?void 0:d.getAttribute("alt"))||void 0,A=f(((V=n.querySelector("figcaption, .thumbcaption"))==null?void 0:V.textContent)||(d==null?void 0:d.getAttribute("title"))||""),B=`${u||""}:${v||A}`;if(!u||O.has(B))return;O.add(B);const I=tt(),N=q(n),U=`wikipedia-media-${c+1}`;C.push({id:U,type:"image",alt:v,caption:A||void 0,src:u,selectorHint:N,sourceOrder:I}),P({id:`${U}-group`,label:A||v||"Wikipedia media",role:"media",text:A||v||u,selectorHint:N,sourceOrder:I})})}function wt(){if(i.length!==0)return i[i.length-1].id}function H(o,l){var O,M,j;if(_)return;if(L++,L>W){_||(_=!0,h.push({type:"node_limit",message:`Page size limit exceeded (processed over ${W} nodes). Extraction has been capped.`,details:`Processed nodes: ${L}`}));return}if(o.nodeType!==Node.ELEMENT_NODE){o.childNodes.forEach(n=>H(n,l));return}const t=o,a=t.tagName.toLowerCase(),S=Y(t,pt);if(["script","style","noscript","template","head","meta","link","title"].includes(a)){E++;return}if(!S&&Y(t,ut)){E++;return}if(!S&&!St(t)){E++;return}x++,m++;const y=t.getAttribute("id")||`visor-el-${m}`,b=q(t);if(xt(t,a)){const n=f(t.textContent||""),c=t.getAttribute("aria-label")||t.getAttribute("title")||"",d=f(((O=t.querySelector("h1, h2, h3, h4, h5, h6"))==null?void 0:O.textContent)||""),u=n.split(new RegExp("(?<=[.!?])\\s+"))[0]||n;w.push({id:`${y}-group`,label:f(c||d||u.slice(0,80)),role:ht(t,a),text:n,selectorHint:b,sourceOrder:m,childActionIds:G(g,b),childMediaIds:G(C,b)})}const T=a.match(/^h([1-6])$/);if(T){const n=parseInt(T[1]),c=f(t.textContent||"");if(c){const d={id:y,text:c,level:n,selectorHint:b,sourceOrder:m};i.push(d),l=y}}else if(a==="pre"||a==="code"){if(!(a==="code"&&((M=t.parentElement)==null?void 0:M.tagName.toLowerCase())==="pre")){const n=t.textContent||"";n.trim()&&s.push({id:y,text:n,selectorHint:b,sourceOrder:m,parentHeadingId:l});return}}else if(a==="table"){const n=[],c=[];let d;const u=t.querySelector("caption");u&&(d=f(u.textContent||"")),t.querySelectorAll("th").forEach(v=>{const A=f(v.textContent||"");A&&n.push(A)}),t.querySelectorAll("tr").forEach(v=>{const A=[];v.querySelectorAll("th, td").forEach(B=>{const I=f(B.textContent||"");I&&A.push(I)}),A.length>0&&c.push(A)}),k.push({id:y,caption:d,headers:n,rows:c,selectorHint:b,sourceOrder:m});return}else if(["img","video","audio","canvas","svg"].includes(a)){const n=a==="img"||a==="svg"?"image":a,c=t,d=t.getAttribute("alt")||t.getAttribute("aria-label")||void 0,u=c.currentSrc||t.getAttribute("src")||t.getAttribute("data-src")||t.getAttribute("srcset")||t.getAttribute("data-srcset")||void 0,v=t.getAttribute("title")||void 0;C.push({id:y,type:n,alt:d,caption:v,src:u,selectorHint:b,sourceOrder:m}),a==="canvas"&&h.push({type:"canvas_only",message:"Page contains a Canvas element. Graphic contents inside Canvas are unreadable as HTML DOM."})}else if(a==="form"){const n=[],c=[];t.querySelectorAll("input, select, textarea, button").forEach((u,v)=>{const A=u.getAttribute("id")||`form-ctrl-${m}-${v}`,B=u.getAttribute("name")||void 0,I=u.tagName.toLowerCase(),N=u.getAttribute("type")||"text",U=u.hasAttribute("required"),V=u.hasAttribute("disabled"),Et=u.getAttribute("placeholder")||void 0;let R=Q.get(u.getAttribute("id")||"")||void 0;if(!R){const D=u.closest("label");D&&(R=f(D.textContent||""))}if(R||(R=u.getAttribute("aria-label")||u.getAttribute("title")||void 0),I==="button"||["submit","button","image","reset"].includes(N)){const D=R||f(u.textContent||"")||N;c.push({id:A,type:"button",label:D,selectorHint:q(u),textContext:f(u.textContent||""),disabled:V,sourceOrder:m})}else{let D=u.value||void 0;(N==="password"||N==="one-time-code"||u.getAttribute("autocomplete")==="one-time-code")&&(D=void 0),n.push({id:A,name:B,type:N,label:R,placeholder:Et,required:U,disabled:V,value:D})}}),$.push({id:y,selectorHint:b,label:t.getAttribute("aria-label")||t.getAttribute("name")||void 0,fields:n,submitControls:c,sourceOrder:m})}else if(a==="button"||t.getAttribute("role")==="button"||a==="input"&&["button","submit","image"].includes(t.getAttribute("type")||"")){const n="button",c=bt(t)||"Button",d=t.hasAttribute("disabled");g.push({id:y,type:n,label:c,selectorHint:b,textContext:f(t.textContent||""),disabled:d,sourceOrder:m})}else if(a==="a"&&t.hasAttribute("href")){const n=t.getAttribute("href")||"",c=f(t.textContent||""),d=t.getAttribute("title")||void 0,u=t.getAttribute("rel")||void 0;t.getAttribute("role")==="button"?g.push({id:y,type:"button",label:c||d||"Link Button",selectorHint:b,textContext:c,sourceOrder:m}):p.push({id:y,text:c||n,href:n,title:d,rel:u,selectorHint:b,sourceOrder:m})}else if(["p","span","li","article","section","div","td","blockquote"].includes(a)){const n=gt(t,a);n.length>3&&s.push({id:y,text:n,selectorHint:b,sourceOrder:m,parentHeadingId:l||wt()});const c=yt(t);c&&C.push({id:`${y}-background`,type:"image",alt:t.getAttribute("aria-label")||void 0,caption:t.getAttribute("title")||void 0,src:c,selectorHint:b,sourceOrder:m})}if(t.shadowRoot&&(h.push({type:"shadow_dom",message:"Shadow DOM encountered and traversed."}),K(t.shadowRoot),t.shadowRoot.childNodes.forEach(n=>H(n,l))),a==="iframe")try{const n=t,c=n.contentDocument||((j=n.contentWindow)==null?void 0:j.document);c?(K(c),c.childNodes.forEach(d=>H(d,l))):h.push({type:"iframe",message:"Cross-origin iframe detected. Content is restricted due to browser same-origin policies.",details:`Source: ${n.src||"about:blank"}`})}catch(n){h.push({type:"iframe",message:"Iframe access blocked. Same-origin validation failed.",details:n.message||n})}t.childNodes.forEach(n=>H(n,l))}let z=document.body;const F=(it=e.siteProfile)==null?void 0:it.mainContentSelector;if(F)try{z=document.querySelector(F)||document.body,z===document.body&&h.push({type:"other",message:"Site profile main content selector did not match. Falling back to document body.",details:F})}catch{h.push({type:"other",message:"Invalid site profile main content selector. Falling back to document body.",details:F})}z&&H(z),At();const Ct=performance.now()-r;return{schemaVersion:"page_snapshot.v1",source:{url:window.location.href,canonicalUrl:((rt=document.querySelector('link[rel="canonical"]'))==null?void 0:rt.getAttribute("href"))||void 0,title:document.title,capturedAt:new Date().toISOString(),language:document.documentElement.lang||void 0},metadata:{generator:"Visor DOM Extractor v0.1.0",userAgent:navigator.userAgent,semanticRoute:et()?"wikipedia_article":"generic"},headings:i,textBlocks:s,links:p,actions:g,layoutGroups:vt(),forms:$,tables:k,media:C,stats:{totalNodes:L,extractedNodes:x,ignoredNodes:E,timeElapsedMs:Ct},warnings:h}}const J="pendingAgentExport",$t=5*60*1e3,Lt=25*1e3,Tt=500,ct={chatgpt:["chatgpt.com","chat.openai.com"],grok:["grok.com"],gemini:["gemini.google.com"],claude:["claude.ai"]},Mt=["textarea:not([disabled])",'[contenteditable="true"]','[role="textbox"]',".ProseMirror"];function dt(e){const r=e.toLowerCase();return Object.keys(ct).find(i=>ct[i].some(s=>r===s||r.endsWith(`.${s}`)))}function Nt(e,r=Date.now()){const i=Date.parse(e.createdAt);return Number.isFinite(i)&&r-i<=$t}function qt(e){const r=e.getBoundingClientRect(),i=window.getComputedStyle(e);return r.width>0&&r.height>0&&i.display!=="none"&&i.visibility!=="hidden"}function Pt(e=document){for(const r of Mt){const s=Array.from(e.querySelectorAll(r)).find(p=>qt(p)?p instanceof HTMLTextAreaElement?!p.disabled&&!p.readOnly:p.isContentEditable||p.getAttribute("role")==="textbox":!1);if(s)return s}return null}function lt(e){e.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText"})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function Ot(e,r){var g;if(e.focus(),e instanceof HTMLTextAreaElement||e instanceof HTMLInputElement)return e.value=r,lt(e),e.value===r;const i=window.getSelection(),s=document.createRange();return s.selectNodeContents(e),s.collapse(!1),i==null||i.removeAllRanges(),i==null||i.addRange(s),(!document.execCommand("insertText",!1,r)||((g=e.textContent)==null?void 0:g.trim())!==r.trim())&&(e.textContent=r),lt(e),(e.textContent||"").trim()===r.trim()}function It(){return new Promise(e=>{chrome.storage.local.get([J],r=>{e(r[J])})})}function Dt(){return chrome.storage.local.remove(J)}function _t(e){return new Promise(r=>window.setTimeout(r,e))}async function Bt(){const e=dt(window.location.hostname);if(!e)return;const r=await It();if(!r||r.provider!==e||!Nt(r))return;const i=Date.now();for(;Date.now()-i<=Lt;){const s=Pt();if(s&&Ot(s,r.text)){await Dt(),console.info(`Visor inserted context into ${e}. Review it before sending.`);return}await _t(Tt)}}const Z={chatgpt:"GPT",grok:"Grok",gemini:"Gemini",claude:"Claude"},Rt={chatgpt:"llm-chatgpt.png",grok:"llm-grok.png",gemini:"llm-gemini.png",claude:"llm-claude.png"};function Ht(){return window.top!==window.self||dt(window.location.hostname)||document.documentElement.dataset.visorWidgetMounted==="true"?!1:!/^chrome:|^chrome-extension:|^about:|^devtools:/i.test(window.location.href)}function jt(e,r){return new Promise(i=>{chrome.runtime.sendMessage({type:"VISOR_EXPORT_ACTIVE_TAB_TO_AGENT",payload:{provider:e,request:r}},s=>{if(chrome.runtime.lastError){i({ok:!1,userMessage:chrome.runtime.lastError.message||"Export failed."});return}i(s||{ok:!1,userMessage:"Export failed."})})})}function Vt(){const e=document.createElement("style");return e.textContent=`
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
    .visor-action {
      position: absolute;
      border: 1px solid var(--visor-border);
      border-radius: 999px;
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      display: grid;
      place-items: center;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.32), 0 0 18px rgba(30, 215, 96, 0.14);
      transition: transform 180ms ease, border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      transform-origin: center;
    }

    .visor-main {
      inset: 0;
      border-color: transparent;
      background: transparent;
      box-shadow: none;
    }

    .visor-main:hover,
    .visor-action:hover {
      border-color: rgba(30, 215, 96, 0.88);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.36), 0 0 22px rgba(30, 215, 96, 0.22);
    }

    .visor-main img {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      object-fit: cover;
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
      pointer-events: none;
    }

    .visor-action[disabled] {
      cursor: wait;
      opacity: 0.62;
    }
  `,e}async function Wt(){if(!Ht())return;document.documentElement.dataset.visorWidgetMounted="true";const r=(await chrome.storage.local.get(["settings"])).settings||{},i={open:!1,mode:r.defaultMode||"agent_action",privacyLevel:r.privacyLevel||"medium",tokenBudget:r.tokenBudget||4e3},s=document.createElement("div");s.id="visor-floating-widget-root";const p=s.attachShadow({mode:"open"}),g=document.createElement("div");g.className="visor-widget";const w=document.createElement("button");w.className="visor-main",w.type="button",w.title="Open Visor agent export widget",w.setAttribute("aria-label","Open Visor agent export widget");const $=document.createElement("img");$.src=chrome.runtime.getURL("visor-logo.png"),$.alt="",w.appendChild($);const k=document.createElement("div");k.className="visor-actions";const C={chatgpt:[-40,-2],grok:[-34,-38],gemini:[0,-54],claude:[34,-38]};Object.keys(Z).forEach(x=>{const E=document.createElement("button");E.className="visor-action",E.type="button",E.title=`Dump current page context to ${Z[x]}`,E.setAttribute("aria-label",`Dump current page context to ${Z[x]}`),E.style.setProperty("--x",`${C[x][0]}px`),E.style.setProperty("--y",`${C[x][1]}px`);const m=document.createElement("img");m.src=chrome.runtime.getURL(Rt[x]),m.alt="",E.appendChild(m),E.addEventListener("click",async W=>{W.stopPropagation(),i.exporting=x,h();const _=await jt(x,{mode:i.mode,privacyLevel:i.privacyLevel,tokenBudget:i.tokenBudget});i.exporting=void 0,E.title=_.ok?`Opened ${Z[x]}`:_.userMessage||"Export failed",h()}),k.appendChild(E)});function h(){g.classList.toggle("open",i.open),k.querySelectorAll(".visor-action").forEach(x=>{x.disabled=!!i.exporting})}w.addEventListener("click",x=>{x.stopPropagation(),i.open=!i.open,h()}),document.addEventListener("keydown",x=>{x.key==="Escape"&&i.open&&(i.open=!1,h())}),p.append(Vt(),g),g.append(k,w),h();const L=()=>{document.body.contains(s)||document.body.appendChild(s)};document.body?L():window.addEventListener("DOMContentLoaded",L,{once:!0})}Bt();Wt();chrome.runtime.onMessage.addListener((e,r,i)=>{if(e.type==="VISOR_EXTRACT_DOM")try{const s=e.payload.settings,p=kt(s);i({ok:!0,snapshot:p})}catch(s){console.error("Visor content script extraction failed:",s),i({ok:!1,error:s.message||s})}return!0});console.log("Visor Content Script Active");
