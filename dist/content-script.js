function lt(e){const i=e.tagName.toLowerCase();if(["input","select","textarea","button"].includes(i))return!0;const o=e.getAttribute("role");return!!(o&&["button","checkbox","radio","combobox","textbox","link"].includes(o))}function St(e){if(e.hasAttribute("hidden")||e.getAttribute("aria-hidden")==="true")return!1;const i=window.getComputedStyle(e);if(i.display==="none"||i.visibility==="hidden"||parseFloat(i.opacity||"1")===0&&!lt(e))return!1;const o=e.getBoundingClientRect();return!(o.width===0&&o.height===0&&!lt(e))}function P(e){const i=dt(e);if(i)return i;if(e.hasAttribute("id")){const f=e.getAttribute("id");if(f&&/^[a-zA-Z0-9_-]+$/.test(f))return`#${f}`}const o=[];let s=e;for(;s&&s.nodeType===Node.ELEMENT_NODE;){const f=dt(s);let m=f||s.tagName.toLowerCase();const w=s.getAttribute("id");if(!f&&w&&/^[a-zA-Z0-9_-]+$/.test(w)){m=`#${w}`,o.unshift(m);break}const $=s.getAttribute("class");if(!f&&$){const A=$.trim().split(/\s+/).filter(b=>/^[a-zA-Z0-9_-]+$/.test(b))[0];A&&(m+=`.${A}`)}const S=s.parentElement;if(S&&!f){const A=Array.from(S.children),b=A.indexOf(s)+1;A.filter(k=>k.tagName===s.tagName).length>1&&(m+=`:nth-child(${b})`)}if(o.unshift(m),f)break;s=s.parentElement}return o.join(" > ")}function dt(e){const i=e.tagName.toLowerCase(),o=["data-testid","data-test","data-cy","data-qa","data-track-id","aria-label"];for(const f of o){const m=e.getAttribute(f);if(m&&m.length<=80)return`${i}[${f}="${Q(m)}"]`}const s=e.getAttribute("role");if(s){const f=e.getAttribute("aria-label");return f&&f.length<=80?`${i}[role="${Q(s)}"][aria-label="${Q(f)}"]`:`${i}[role="${Q(s)}"]`}}function Q(e){return e.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function $t(e){var it,st,at,ct;const i=performance.now(),o=[],s=[],f=[],m=[],w=[],$=[],S=[],A=[],b=[];let q=0,k=0,O=0,d=0;const E=12e3;let L=!1;const I=new Map;function z(n){try{n.querySelectorAll("label").forEach(t=>{const a=t.getAttribute("for"),C=(t.textContent||"").trim().replace(/\s+/g," ");a&&C&&I.set(a,C)})}catch{}}z(document);const tt=((it=e.siteProfile)==null?void 0:it.ignoreSelectors)||[],G=((st=e.siteProfile)==null?void 0:st.preserveSelectors)||[];function H(n,l){return l.some(t=>{try{return n.matches(t)}catch{return b.push({type:"other",message:"Invalid site profile selector ignored.",details:t}),!1}})}function p(n){return n.trim().replace(/\s+/g," ")}function ft(n){let l="";for(let t=0;t<n.childNodes.length;t++){const a=n.childNodes[t];a.nodeType===Node.TEXT_NODE&&(l+=a.textContent)}return p(l)}function mt(n,l){return["p","li","blockquote","td","span"].includes(l)||bt(n)?p(n.textContent||""):ft(n)}function bt(n){const l=p(n.textContent||"");return l.length<4||l.length>700||n.querySelectorAll("article, section, div, table, form, ul, ol, nav, aside, header, footer").length>3?!1:n.querySelectorAll("a, span, strong, em, b, i, small, sup, sub").length>0}function ht(n){const l=n.getAttribute("aria-label"),t=n.getAttribute("title"),a=n.getAttribute("aria-labelledby"),C=a==null?void 0:a.split(/\s+/).map(D=>{var N;return((N=document.getElementById(D))==null?void 0:N.textContent)||""}).filter(Boolean).join(" "),v=p(n.textContent||""),h=n.value,T=n.getAttribute("name")||n.getAttribute("data-testid")||n.getAttribute("data-test")||n.getAttribute("data-cy");return p(C||l||t||v||h||T||"")}function xt(n,l){const t=n.getAttribute("role"),a=`${l} ${t||""} ${n.getAttribute("class")||""} ${n.getAttribute("data-testid")||""}`.toLowerCase();return a.includes("dialog")||t==="dialog"?"dialog":a.includes("nav")||t==="navigation"||l==="nav"?"nav":a.includes("card")||a.includes("plan")||a.includes("tier")||a.includes("price")?"card":l==="ul"||l==="ol"||t==="list"?"list":l==="section"||l==="article"||t==="region"?"section":"generic"}function vt(n,l){if(!["article","section","div","li","ul","ol","nav","aside"].includes(l))return!1;const t=p(n.textContent||"");if(t.length<20||t.length>1200)return!1;const a=`${l} ${n.getAttribute("role")||""} ${n.getAttribute("class")||""} ${n.getAttribute("data-testid")||""}`.toLowerCase(),C=n.querySelectorAll('button, a[href], img, video, svg, [role="button"], [aria-label]').length>0,v=/\b(plan|tier|price|premium|fan|mega|benefit|feature|subscription|monthly|yearly|\$\s?\d|\d+[.,]\d{2})\b/i.test(t+" "+a),h=n.querySelectorAll("article, section, div, li, table, form").length;return(C||v)&&h<=12}function Y(n,l){return n.filter(t=>t.selectorHint===l||t.selectorHint.startsWith(`${l} > `)).map(t=>t.id).slice(0,20)}function yt(){return w.map(n=>({...n,childActionIds:Y(m,n.selectorHint),childMediaIds:Y(A,n.selectorHint)}))}function wt(n){const t=window.getComputedStyle(n).backgroundImage.match(/url\(["']?(.*?)["']?\)/);return t==null?void 0:t[1]}function nt(){return d++,d}function B(n){!n.text||w.some(l=>l.id===n.id)||w.push({...n,sourceOrder:n.sourceOrder||nt(),childActionIds:[],childMediaIds:[]})}function rt(){return/(^|\.)wikipedia\.org$/i.test(window.location.hostname)&&!!document.querySelector("#mw-content-text, .mw-parser-output")}function At(){var N,U;if(!rt())return;const n=document.querySelector(".mw-parser-output");if(!n)return;b.push({type:"other",message:"Wikipedia semantic route applied: lead, TOC, infobox, sections, references, media, and nav are preserved as separate layout groups."});const l=p(((N=document.querySelector("#firstHeading"))==null?void 0:N.textContent)||document.title),t=[];for(const r of Array.from(n.children)){if(r.matches("h2, .mw-heading2, #toc, .vector-toc, table.infobox"))break;if(r.matches("p")){const c=p(r.textContent||"");c.length>40&&t.push(c)}}t.length>0&&B({id:"wikipedia-lead",label:`${l} lead`,role:"lead",text:t.join(`

`),selectorHint:".mw-parser-output > p"});const a=document.querySelector('#toc, .vector-toc, [aria-label="Contents"]');if(a){const r=Array.from(a.querySelectorAll("a")).map(c=>p(c.textContent||"")).filter(Boolean).slice(0,80);B({id:"wikipedia-toc",label:"Table of contents",role:"toc",text:r.join(`
`),selectorHint:P(a)})}const C=n.querySelector("table.infobox");if(C){const r=p(C.textContent||"");B({id:"wikipedia-infobox",label:p(((U=C.querySelector("caption, th"))==null?void 0:U.textContent)||`${l} infobox`),role:"infobox",text:r,selectorHint:P(C)})}Array.from(n.querySelectorAll("h2, .mw-heading2")).forEach((r,c)=>{const u=p(r.textContent||"").replace(/\[edit\]$/i,"").trim();if(!u)return;const g=[];let x=r.nextElementSibling;for(;x&&!x.matches("h2, .mw-heading2");){if(x.matches("p, ul, ol, table, figure, .thumb, .reflist, ol.references")){const y=p(x.textContent||"");y.length>20&&g.push(y)}x=x.nextElementSibling}g.length>0&&B({id:`wikipedia-section-${c+1}`,label:u,role:/references|notes|bibliography|external links/i.test(u)?"references":"article_section",text:g.join(`

`).slice(0,6e3),selectorHint:P(r)})});const h=n.querySelector('.reflist, ol.references, section[aria-labelledby="References"]');if(h){const r=Array.from(h.querySelectorAll("li, cite")).map(c=>p(c.textContent||"")).filter(c=>c.length>10).slice(0,80);B({id:"wikipedia-references",label:"References",role:"references",text:r.join(`
`),selectorHint:P(h)})}const T=document.querySelector("#p-navigation, .vector-page-toolbar, nav[aria-label]");if(T){const r=Array.from(T.querySelectorAll("a, button")).map(c=>p(c.textContent||c.getAttribute("aria-label")||"")).filter(Boolean).slice(0,60).join(`
`);B({id:"wikipedia-nav",label:"Page navigation",role:"nav",text:r,selectorHint:P(T)})}const D=new Set(A.map(r=>`${r.src||""}:${r.alt||""}`));n.querySelectorAll("figure, .thumb, .mw-file-description").forEach((r,c)=>{var X;const u=r.querySelector("img"),g=(u==null?void 0:u.currentSrc)||(u==null?void 0:u.getAttribute("src"))||(u==null?void 0:u.getAttribute("srcset"))||void 0,x=(u==null?void 0:u.getAttribute("alt"))||void 0,y=p(((X=r.querySelector("figcaption, .thumbcaption"))==null?void 0:X.textContent)||(u==null?void 0:u.getAttribute("title"))||""),j=`${g||""}:${x||y}`;if(!g||D.has(j))return;D.add(j);const _=nt(),M=P(r),J=`wikipedia-media-${c+1}`;A.push({id:J,type:"image",alt:x,caption:y||void 0,src:g,selectorHint:M,sourceOrder:_}),B({id:`${J}-group`,label:y||x||"Wikipedia media",role:"media",text:y||x||g,selectorHint:M,sourceOrder:_})})}function Ct(){if(o.length!==0)return o[o.length-1].id}function F(n,l){var D,N,U;if(L)return;if(q++,q>E){L||(L=!0,b.push({type:"node_limit",message:`Page size limit exceeded (processed over ${E} nodes). Extraction has been capped.`,details:`Processed nodes: ${q}`}));return}if(n.nodeType!==Node.ELEMENT_NODE){n.childNodes.forEach(r=>F(r,l));return}const t=n,a=t.tagName.toLowerCase(),C=H(t,G);if(["script","style","noscript","template","head","meta","link","title"].includes(a)){O++;return}if(!C&&H(t,tt)){O++;return}if(!C&&!St(t)){O++;return}k++,d++;const v=t.getAttribute("id")||`visor-el-${d}`,h=P(t);if(vt(t,a)){const r=p(t.textContent||""),c=t.getAttribute("aria-label")||t.getAttribute("title")||"",u=p(((D=t.querySelector("h1, h2, h3, h4, h5, h6"))==null?void 0:D.textContent)||""),g=r.split(new RegExp("(?<=[.!?])\\s+"))[0]||r;w.push({id:`${v}-group`,label:p(c||u||g.slice(0,80)),role:xt(t,a),text:r,selectorHint:h,sourceOrder:d,childActionIds:Y(m,h),childMediaIds:Y(A,h)})}const T=a.match(/^h([1-6])$/);if(T){const r=parseInt(T[1]),c=p(t.textContent||"");if(c){const u={id:v,text:c,level:r,selectorHint:h,sourceOrder:d};o.push(u),l=v}}else if(a==="pre"||a==="code"){if(!(a==="code"&&((N=t.parentElement)==null?void 0:N.tagName.toLowerCase())==="pre")){const r=t.textContent||"";r.trim()&&s.push({id:v,text:r,selectorHint:h,sourceOrder:d,parentHeadingId:l});return}}else if(a==="table"){const r=[],c=[];let u;const g=t.querySelector("caption");g&&(u=p(g.textContent||"")),t.querySelectorAll("th").forEach(x=>{const y=p(x.textContent||"");y&&r.push(y)}),t.querySelectorAll("tr").forEach(x=>{const y=[];x.querySelectorAll("th, td").forEach(j=>{const _=p(j.textContent||"");_&&y.push(_)}),y.length>0&&c.push(y)}),S.push({id:v,caption:u,headers:r,rows:c,selectorHint:h,sourceOrder:d});return}else if(["img","video","audio","canvas","svg"].includes(a)){const r=a==="img"||a==="svg"?"image":a,c=t,u=t.getAttribute("alt")||t.getAttribute("aria-label")||void 0,g=c.currentSrc||t.getAttribute("src")||t.getAttribute("data-src")||t.getAttribute("srcset")||t.getAttribute("data-srcset")||void 0,x=t.getAttribute("title")||void 0;A.push({id:v,type:r,alt:u,caption:x,src:g,selectorHint:h,sourceOrder:d}),a==="canvas"&&b.push({type:"canvas_only",message:"Page contains a Canvas element. Graphic contents inside Canvas are unreadable as HTML DOM."})}else if(a==="form"){const r=[],c=[];t.querySelectorAll("input, select, textarea, button").forEach((g,x)=>{const y=g.getAttribute("id")||`form-ctrl-${d}-${x}`,j=g.getAttribute("name")||void 0,_=g.tagName.toLowerCase(),M=g.getAttribute("type")||"text",J=g.hasAttribute("required"),X=g.hasAttribute("disabled"),kt=g.getAttribute("placeholder")||void 0;let V=I.get(g.getAttribute("id")||"")||void 0;if(!V){const R=g.closest("label");R&&(V=p(R.textContent||""))}if(V||(V=g.getAttribute("aria-label")||g.getAttribute("title")||void 0),_==="button"||["submit","button","image","reset"].includes(M)){const R=V||p(g.textContent||"")||M;c.push({id:y,type:"button",label:R,selectorHint:P(g),textContext:p(g.textContent||""),disabled:X,sourceOrder:d})}else{let R=g.value||void 0;(M==="password"||M==="one-time-code"||g.getAttribute("autocomplete")==="one-time-code")&&(R=void 0),r.push({id:y,name:j,type:M,label:V,placeholder:kt,required:J,disabled:X,value:R})}}),$.push({id:v,selectorHint:h,label:t.getAttribute("aria-label")||t.getAttribute("name")||void 0,fields:r,submitControls:c,sourceOrder:d})}else if(a==="button"||t.getAttribute("role")==="button"||a==="input"&&["button","submit","image"].includes(t.getAttribute("type")||"")){const r="button",c=ht(t)||"Button",u=t.hasAttribute("disabled");m.push({id:v,type:r,label:c,selectorHint:h,textContext:p(t.textContent||""),disabled:u,sourceOrder:d})}else if(a==="a"&&t.hasAttribute("href")){const r=t.getAttribute("href")||"",c=p(t.textContent||""),u=t.getAttribute("title")||void 0,g=t.getAttribute("rel")||void 0;t.getAttribute("role")==="button"?m.push({id:v,type:"button",label:c||u||"Link Button",selectorHint:h,textContext:c,sourceOrder:d}):f.push({id:v,text:c||r,href:r,title:u,rel:g,selectorHint:h,sourceOrder:d})}else if(["p","span","li","article","section","div","td","blockquote"].includes(a)){const r=mt(t,a);r.length>3&&s.push({id:v,text:r,selectorHint:h,sourceOrder:d,parentHeadingId:l||Ct()});const c=wt(t);c&&A.push({id:`${v}-background`,type:"image",alt:t.getAttribute("aria-label")||void 0,caption:t.getAttribute("title")||void 0,src:c,selectorHint:h,sourceOrder:d})}if(t.shadowRoot&&(b.push({type:"shadow_dom",message:"Shadow DOM encountered and traversed."}),z(t.shadowRoot),t.shadowRoot.childNodes.forEach(r=>F(r,l))),a==="iframe")try{const r=t,c=r.contentDocument||((U=r.contentWindow)==null?void 0:U.document);c?(z(c),c.childNodes.forEach(u=>F(u,l))):b.push({type:"iframe",message:"Cross-origin iframe detected. Content is restricted due to browser same-origin policies.",details:`Source: ${r.src||"about:blank"}`})}catch(r){b.push({type:"iframe",message:"Iframe access blocked. Same-origin validation failed.",details:r.message||r})}t.childNodes.forEach(r=>F(r,l))}let Z=document.body;const K=(at=e.siteProfile)==null?void 0:at.mainContentSelector;if(K)try{Z=document.querySelector(K)||document.body,Z===document.body&&b.push({type:"other",message:"Site profile main content selector did not match. Falling back to document body.",details:K})}catch{b.push({type:"other",message:"Invalid site profile main content selector. Falling back to document body.",details:K})}Z&&F(Z),At();const Et=performance.now()-i;return{schemaVersion:"page_snapshot.v1",source:{url:window.location.href,canonicalUrl:((ct=document.querySelector('link[rel="canonical"]'))==null?void 0:ct.getAttribute("href"))||void 0,title:document.title,capturedAt:new Date().toISOString(),language:document.documentElement.lang||void 0},metadata:{generator:"Visor DOM Extractor v0.1.0",userAgent:navigator.userAgent,semanticRoute:rt()?"wikipedia_article":"generic"},headings:o,textBlocks:s,links:f,actions:m,layoutGroups:yt(),forms:$,tables:S,media:A,stats:{totalNodes:q,extractedNodes:k,ignoredNodes:O,timeElapsedMs:Et},warnings:b}}const ot="pendingAgentExport",Lt=5*60*1e3,Tt=25*1e3,Nt=500,ut={chatgpt:["chatgpt.com","chat.openai.com"],grok:["grok.com"],gemini:["gemini.google.com"],claude:["claude.ai"]},Mt=["textarea:not([disabled])",'[contenteditable="true"]','[role="textbox"]',".ProseMirror"];function gt(e){const i=e.toLowerCase();return Object.keys(ut).find(o=>ut[o].some(s=>i===s||i.endsWith(`.${s}`)))}function Pt(e,i=Date.now()){const o=Date.parse(e.createdAt);return Number.isFinite(o)&&i-o<=Lt}function qt(e){const i=e.getBoundingClientRect(),o=window.getComputedStyle(e);return i.width>0&&i.height>0&&o.display!=="none"&&o.visibility!=="hidden"}function Ot(e=document){for(const i of Mt){const s=Array.from(e.querySelectorAll(i)).find(f=>qt(f)?f instanceof HTMLTextAreaElement?!f.disabled&&!f.readOnly:f.isContentEditable||f.getAttribute("role")==="textbox":!1);if(s)return s}return null}function pt(e){e.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText"})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function It(e,i){var m;if(e.focus(),e instanceof HTMLTextAreaElement||e instanceof HTMLInputElement)return e.value=i,pt(e),e.value===i;const o=window.getSelection(),s=document.createRange();return s.selectNodeContents(e),s.collapse(!1),o==null||o.removeAllRanges(),o==null||o.addRange(s),(!document.execCommand("insertText",!1,i)||((m=e.textContent)==null?void 0:m.trim())!==i.trim())&&(e.textContent=i),pt(e),(e.textContent||"").trim()===i.trim()}function Bt(){return new Promise(e=>{chrome.storage.local.get([ot],i=>{e(i[ot])})})}function Dt(){return chrome.storage.local.remove(ot)}function _t(e){return new Promise(i=>window.setTimeout(i,e))}async function Rt(){const e=gt(window.location.hostname);if(!e)return;const i=await Bt();if(!i||i.provider!==e||!Pt(i))return;const o=Date.now();for(;Date.now()-o<=Tt;){const s=Ot();if(s&&It(s,i.text)){await Dt(),console.info(`Visor inserted context into ${e}. Review it before sending.`);return}await _t(Nt)}}const W={chatgpt:"GPT",grok:"Grok",gemini:"Gemini",claude:"Claude"},Ht=["compact","detailed","agent_action","rag","debug"],jt=["low","medium","strict"],Vt=[2e3,4e3,8e3,12e3];function Wt(){return window.top!==window.self||gt(window.location.hostname)||document.documentElement.dataset.visorWidgetMounted==="true"?!1:!/^chrome:|^chrome-extension:|^about:|^devtools:/i.test(window.location.href)}function zt(e,i){return new Promise(o=>{chrome.runtime.sendMessage({type:"VISOR_EXPORT_ACTIVE_TAB_TO_AGENT",payload:{provider:e,request:i}},s=>{if(chrome.runtime.lastError){o({ok:!1,userMessage:chrome.runtime.lastError.message||"Export failed."});return}o(s||{ok:!1,userMessage:"Export failed."})})})}function et(e,i){const o=e.indexOf(i);return e[(o+1)%e.length]}function Gt(){const e=document.createElement("style");return e.textContent=`
    :host {
      all: initial;
      color-scheme: dark;
      --visor-green: #1ed760;
      --visor-green-deep: #0e7a3a;
      --visor-black: #030706;
      --visor-panel: rgba(5, 12, 10, 0.92);
      --visor-border: rgba(30, 215, 96, 0.38);
      --visor-text: #ecfff4;
      --visor-muted: #8fb59e;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .visor-widget {
      position: fixed;
      right: 22px;
      bottom: 24px;
      width: 64px;
      height: 64px;
      z-index: 2147483647;
      pointer-events: auto;
    }

    .visor-main {
      position: absolute;
      inset: 0;
      border: 1px solid var(--visor-border);
      border-radius: 999px;
      background: radial-gradient(circle at 35% 28%, rgba(30, 215, 96, 0.24), rgba(0, 0, 0, 0.95) 62%);
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.52), 0 0 0 1px rgba(30, 215, 96, 0.16), 0 0 28px rgba(30, 215, 96, 0.22);
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
    }

    .visor-main:hover {
      transform: translateY(-2px) scale(1.03);
      border-color: rgba(30, 215, 96, 0.78);
      box-shadow: 0 20px 52px rgba(0, 0, 0, 0.56), 0 0 34px rgba(30, 215, 96, 0.32);
    }

    .visor-main img {
      width: 48px;
      height: 48px;
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
      position: absolute;
      width: 54px;
      height: 54px;
      left: 5px;
      top: 5px;
      border: 1px solid var(--visor-border);
      border-radius: 999px;
      background: linear-gradient(145deg, rgba(7, 20, 15, 0.98), rgba(0, 0, 0, 0.94));
      color: var(--visor-text);
      font: 700 11px/1 Inter, ui-sans-serif, system-ui, sans-serif;
      cursor: pointer;
      box-shadow: 0 12px 34px rgba(0, 0, 0, 0.48), 0 0 18px rgba(30, 215, 96, 0.16);
      transform: translate(0, 0) scale(0.72);
      transition: transform 180ms ease, border-color 160ms ease, background 160ms ease;
    }

    .visor-widget.open .visor-action {
      transform: translate(var(--x), var(--y)) scale(1);
    }

    .visor-action:hover {
      border-color: rgba(30, 215, 96, 0.95);
      background: linear-gradient(145deg, rgba(30, 215, 96, 0.24), rgba(0, 0, 0, 0.95));
    }

    .visor-action[disabled] {
      cursor: wait;
      opacity: 0.72;
    }

    .visor-settings {
      position: absolute;
      right: 0;
      bottom: 78px;
      width: 188px;
      padding: 10px;
      border: 1px solid var(--visor-border);
      border-radius: 14px;
      background: var(--visor-panel);
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
      opacity: 0;
      transform: translateY(8px);
      pointer-events: none;
      transition: opacity 140ms ease, transform 140ms ease;
    }

    .visor-widget.open .visor-settings {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .visor-title {
      color: var(--visor-green);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 7px;
    }

    .visor-row {
      display: grid;
      grid-template-columns: 52px 1fr;
      gap: 6px;
      align-items: center;
      margin-top: 6px;
    }

    .visor-label {
      color: var(--visor-muted);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .visor-chip {
      min-width: 0;
      border: 1px solid rgba(30, 215, 96, 0.26);
      border-radius: 999px;
      background: rgba(30, 215, 96, 0.08);
      color: var(--visor-text);
      padding: 6px 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .visor-status {
      margin-top: 8px;
      min-height: 14px;
      color: var(--visor-muted);
      font-size: 10px;
      line-height: 1.35;
    }
  `,e}async function Ft(){if(!Wt())return;document.documentElement.dataset.visorWidgetMounted="true";const i=(await chrome.storage.local.get(["settings"])).settings||{},o={open:!1,mode:i.defaultMode||"agent_action",privacyLevel:i.privacyLevel||"medium",tokenBudget:i.tokenBudget||4e3,status:"Ready"},s=document.createElement("div");s.id="visor-floating-widget-root";const f=s.attachShadow({mode:"open"}),m=document.createElement("div");m.className="visor-widget";const w=document.createElement("button");w.className="visor-main",w.type="button",w.title="Open Visor agent export widget",w.setAttribute("aria-label","Open Visor agent export widget");const $=document.createElement("img");$.src=chrome.runtime.getURL("visor-logo.png"),$.alt="",w.appendChild($);const S=document.createElement("div");S.className="visor-actions";const A={chatgpt:[-66,-12],grok:[-52,-76],gemini:[12,-108],claude:[76,-76]};Object.keys(W).forEach(d=>{const E=document.createElement("button");E.className="visor-action",E.type="button",E.textContent=W[d],E.title=`Dump current page context to ${W[d]}`,E.setAttribute("aria-label",`Dump current page context to ${W[d]}`),E.style.setProperty("--x",`${A[d][0]}px`),E.style.setProperty("--y",`${A[d][1]}px`),E.addEventListener("click",async L=>{L.stopPropagation(),o.exporting=d,o.status=`Exporting to ${W[d]}...`,k();const I=await zt(d,{mode:o.mode,privacyLevel:o.privacyLevel,tokenBudget:o.tokenBudget});o.exporting=void 0,o.status=I.ok?`Opened ${W[d]}`:I.userMessage||"Export failed",k()}),S.appendChild(E)});const b=document.createElement("div");b.className="visor-settings";function q(){b.innerHTML="";const d=document.createElement("div");d.className="visor-title",d.textContent="Direct dump settings",b.appendChild(d),[["Mode",o.mode.replace("_"," "),()=>{o.mode=et(Ht,o.mode)}],["Privacy",o.privacyLevel,()=>{o.privacyLevel=et(jt,o.privacyLevel)}],["Budget",`${o.tokenBudget}`,()=>{o.tokenBudget=et(Vt,o.tokenBudget)}]].forEach(([I,z,tt])=>{const G=document.createElement("div");G.className="visor-row";const H=document.createElement("div");H.className="visor-label",H.textContent=I;const p=document.createElement("button");p.className="visor-chip",p.type="button",p.textContent=z,p.addEventListener("click",()=>{tt(),k()}),G.append(H,p),b.appendChild(G)});const L=document.createElement("div");L.className="visor-status",L.textContent=o.status,b.appendChild(L)}function k(){m.classList.toggle("open",o.open),S.querySelectorAll(".visor-action").forEach(d=>{d.disabled=!!o.exporting}),q()}w.addEventListener("click",d=>{d.stopPropagation(),o.open=!o.open,k()}),document.addEventListener("keydown",d=>{d.key==="Escape"&&o.open&&(o.open=!1,k())}),f.append(Gt(),m),m.append(S,b,w),k();const O=()=>{document.body.contains(s)||document.body.appendChild(s)};document.body?O():window.addEventListener("DOMContentLoaded",O,{once:!0})}Rt();Ft();chrome.runtime.onMessage.addListener((e,i,o)=>{if(e.type==="VISOR_EXTRACT_DOM")try{const s=e.payload.settings,f=$t(s);o({ok:!0,snapshot:f})}catch(s){console.error("Visor content script extraction failed:",s),o({ok:!1,error:s.message||s})}return!0});console.log("Visor Content Script Active");
