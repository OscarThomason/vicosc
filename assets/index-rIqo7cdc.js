import*as e from"https://esm.sh/three";import{EffectComposer as t}from"https://esm.sh/three/examples/jsm/postprocessing/EffectComposer.js";import{RenderPass as n}from"https://esm.sh/three/examples/jsm/postprocessing/RenderPass.js";import{UnrealBloomPass as r}from"https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js";import{OutputPass as i}from"https://esm.sh/three/examples/jsm/postprocessing/OutputPass.js";import{ShaderPass as a}from"https://esm.sh/three/examples/jsm/postprocessing/ShaderPass.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var o=new class{constructor(){this.preloader=document.getElementById(`preloader`),this.mainContent=document.getElementById(`main-content`),this.progressBar=document.querySelector(`.progress-bar`),this.loadingSteps=0,this.totalSteps=5,this.isComplete=!1}updateProgress(e){this.loadingSteps=Math.min(e,this.totalSteps);let t=this.loadingSteps/this.totalSteps*100;this.progressBar.style.width=`${t}%`}complete(e){this.isComplete||(this.isComplete=!0,this.updateProgress(this.totalSteps),setTimeout(()=>{this.preloader.classList.add(`fade-out`),this.mainContent.classList.add(`fade-in`),e.classList.add(`fade-in`),setTimeout(()=>{this.preloader.style.display=`none`},1e3)},1500))}};document.body.style.transform=`translateZ(0)`,document.body.style.backfaceVisibility=`hidden`,document.body.style.perspective=`1000px`,o.updateProgress(1);var s=new e.Scene;s.background=null;var c=new e.PerspectiveCamera(75,window.innerWidth/window.innerHeight,.1,1e3);c.position.z=20,o.updateProgress(2);var l=window.innerWidth<768,u=new e.WebGLRenderer({antialias:!l,powerPreference:`high-performance`,alpha:!0,premultipliedAlpha:!1,stencil:!1,depth:!0,preserveDrawingBuffer:!1});u.setPixelRatio(Math.min(window.devicePixelRatio,l?1:1.5)),u.setSize(window.innerWidth,window.innerHeight),u.toneMapping=e.ACESFilmicToneMapping,u.toneMappingExposure=.9,u.setClearColor(0,0),document.body.appendChild(u.domElement),u.domElement.style.position=`absolute`,u.domElement.style.top=`0`,u.domElement.style.left=`0`,u.domElement.style.zIndex=`2`,u.domElement.style.pointerEvents=`auto`,u.domElement.style.background=`transparent`;var d={strength:.3,radius:1.25,threshold:0},f=new t(u),p=new n(s,c);f.addPass(p);var m=new r(new e.Vector2(window.innerWidth,window.innerHeight),d.strength,d.radius,d.threshold);f.addPass(m),o.updateProgress(3);var h=new a({uniforms:{tDiffuse:{value:null},uTime:{value:0},uResolution:{value:new e.Vector2(window.innerWidth,window.innerHeight)},uAnalogGrain:{value:.4},uAnalogBleeding:{value:1},uAnalogVSync:{value:1},uAnalogScanlines:{value:1},uAnalogVignette:{value:1},uAnalogJitter:{value:.4},uAnalogIntensity:{value:.6},uLimboMode:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uAnalogGrain;
    uniform float uAnalogBleeding;
    uniform float uAnalogVSync;
    uniform float uAnalogScanlines;
    uniform float uAnalogVignette;
    uniform float uAnalogJitter;
    uniform float uAnalogIntensity;
    uniform float uLimboMode;
    
    varying vec2 vUv;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float random(float x) {
      return fract(sin(x) * 43758.5453123);
    }
    
    // Advanced procedural grain based on film grain simulation
    float gaussian(float z, float u, float o) {
      return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
    }
    
    vec3 grain(vec2 uv, float time, float intensity) {
      float seed = dot(uv, vec2(12.9898, 78.233));
      float noise = fract(sin(seed) * 43758.5453 + time * 2.0);
      noise = gaussian(noise, 0.0, 0.5 * 0.5);
      
      return vec3(noise) * intensity;
    }
    
    void main() {
      vec2 uv = vUv;
      float time = uTime * 1.8;
      
      // Analog Jitter - temporal instability
      vec2 jitteredUV = uv;
      if (uAnalogJitter > 0.01) {
        float jitterAmount = (random(vec2(floor(time * 60.0))) - 0.5) * 0.003 * uAnalogJitter * uAnalogIntensity;
        jitteredUV.x += jitterAmount;
        jitteredUV.y += (random(vec2(floor(time * 30.0) + 1.0)) - 0.5) * 0.001 * uAnalogJitter * uAnalogIntensity;
      }
      
      // VHS-style vertical sync roll
      if (uAnalogVSync > 0.01) {
        float vsyncRoll = sin(time * 2.0 + uv.y * 100.0) * 0.02 * uAnalogVSync * uAnalogIntensity;
        float vsyncChance = step(0.95, random(vec2(floor(time * 4.0))));
        jitteredUV.y += vsyncRoll * vsyncChance;
      }
      
      vec4 color = texture2D(tDiffuse, jitteredUV);
      
      // Color bleeding/channel separation
      if (uAnalogBleeding > 0.01) {
        float bleedAmount = 0.012 * uAnalogBleeding * uAnalogIntensity;
        float offsetPhase = time * 1.5 + uv.y * 20.0;
        
        vec2 redOffset = vec2(sin(offsetPhase) * bleedAmount, 0.0);
        vec2 blueOffset = vec2(-sin(offsetPhase * 1.1) * bleedAmount * 0.8, 0.0);
        
        float r = texture2D(tDiffuse, jitteredUV + redOffset).r;
        float g = texture2D(tDiffuse, jitteredUV).g;
        float b = texture2D(tDiffuse, jitteredUV + blueOffset).b;
        
        color = vec4(r, g, b, color.a);
      }
      
      // Improved procedural film grain
      if (uAnalogGrain > 0.01) {
        vec3 grainEffect = grain(uv, time, 0.075 * uAnalogGrain * uAnalogIntensity);
        grainEffect *= (1.0 - color.rgb);
        color.rgb += grainEffect;
      }
      
      // Scanlines
      if (uAnalogScanlines > 0.01) {
        float scanlineFreq = 600.0 + uAnalogScanlines * 400.0;
        float scanlinePattern = sin(uv.y * scanlineFreq) * 0.5 + 0.5;
        float scanlineIntensity = 0.1 * uAnalogScanlines * uAnalogIntensity;
        color.rgb *= (1.0 - scanlinePattern * scanlineIntensity);
        
        float horizontalLines = sin(uv.y * scanlineFreq * 0.1) * 0.02 * uAnalogScanlines * uAnalogIntensity;
        color.rgb *= (1.0 - horizontalLines);
      }
      
      // Vignetting
      if (uAnalogVignette > 0.01) {
        vec2 vignetteUV = (uv - 0.5) * 2.0;
        float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3 * uAnalogVignette * uAnalogIntensity;
        color.rgb *= vignette;
      }
      
      // Simple Limbo Mode (Black and White)
      if (uLimboMode > 0.5) {
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = vec3(gray);
      }
      
      gl_FragColor = color;
    }
  `});f.addPass(h);var g=new i;f.addPass(g);var _={bodyColor:0,glowColor:`black`,eyeGlowColor:`yellow`,ghostOpacity:.88,ghostScale:2.4,emissiveIntensity:5.8,pulseSpeed:1.6,pulseIntensity:.6,eyeGlowIntensity:4.5,eyeGlowDecay:.95,eyeGlowResponse:.31,rimLightIntensity:1.8,followSpeed:.075,wobbleAmount:.35,floatSpeed:1.6,movementThreshold:.07,particleCount:250,particleDecayRate:.005,particleColor:`orange`,createParticlesOnlyWhenMoving:!0,particleCreationRate:5,revealRadius:43,fadeStrength:2.2,baseOpacity:.35,revealOpacity:0,fireflyGlowIntensity:2.6,fireflySpeed:.04,analogIntensity:.6,analogGrain:.4,analogBleeding:1,analogVSync:1,analogScanlines:1,analogVignette:1,analogJitter:.4,limboMode:!1},v={black:0,cyan:65535,lime:65280,magenta:16711935,yellow:16776960,orange:16729344,pink:16716947,purple:9699539,blue:33023,green:65408,red:16711744,teal:65450,violet:9055202},y=new e.PlaneGeometry(300,300),b=new e.ShaderMaterial({uniforms:{ghostPosition:{value:new e.Vector3(0,0,0)},revealRadius:{value:_.revealRadius},fadeStrength:{value:_.fadeStrength},baseOpacity:{value:_.baseOpacity},revealOpacity:{value:_.revealOpacity},time:{value:0}},vertexShader:`
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform vec3 ghostPosition;
    uniform float revealRadius;
    uniform float fadeStrength;
    uniform float baseOpacity;
    uniform float revealOpacity;
    uniform float time;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      float dist = distance(vWorldPosition.xy, ghostPosition.xy);
      
      // Pulsing reveal radius
      float dynamicRadius = revealRadius + sin(time * 2.0) * 5.0;
      
      // Create smooth reveal gradient
      float reveal = smoothstep(dynamicRadius * 0.2, dynamicRadius, dist);
      reveal = pow(reveal, fadeStrength);
      
      // Mix between revealed and base opacity
      float opacity = mix(revealOpacity, baseOpacity, reveal);
      
      // EXTREMELY low RGB values to avoid bloom
      gl_FragColor = vec4(0.001, 0.001, 0.002, opacity);
    }
  `,transparent:!0,depthWrite:!1}),x=new e.Mesh(y,b);x.position.z=-50,x.renderOrder=-100,s.add(x);var S=new e.AmbientLight(657966,.08);s.add(S);var C=new e.Group;s.add(C);var w=new e.SphereGeometry(2,40,40),T=w.getAttribute(`position`).array;for(let e=0;e<T.length;e+=3)if(T[e+1]<-.2){let t=T[e],n=T[e+2],r=Math.sin(t*5)*.35,i=Math.cos(n*4)*.25,a=Math.sin((t+n)*3)*.15,o=r+i+a;T[e+1]=-2+o}w.computeVertexNormals();var E=new e.MeshStandardMaterial({color:_.bodyColor,transparent:!0,opacity:_.ghostOpacity,emissive:v[_.glowColor],emissiveIntensity:_.emissiveIntensity,roughness:.02,metalness:0,side:e.DoubleSide,alphaTest:.1}),D=new e.Mesh(w,E);C.add(D);var O=new e.DirectionalLight(4886754,_.rimLightIntensity);O.position.set(-8,6,-4),s.add(O);var k=new e.DirectionalLight(5301186,_.rimLightIntensity*.7);k.position.set(8,-4,-6),s.add(k),o.updateProgress(4);function ee(){let t=new e.Group;C.add(t);let n=new e.CircleGeometry(.2,32),r=new e.MeshBasicMaterial({color:16776960,transparent:!0,opacity:1}),i=new e.Mesh(n,r);i.position.set(-.55,.45,1.95),i.lookAt(new e.Vector3(-.55,.45,5)),t.add(i);let a=new e.MeshBasicMaterial({color:16776960,transparent:!0,opacity:1}),o=new e.Mesh(n,a);o.position.set(.55,.45,1.95),o.lookAt(new e.Vector3(.55,.45,5)),t.add(o);let s=new e.CurvePath,c=[new e.Vector3(-.7,-.1,1.85),new e.Vector3(-.525,-.6,1.92),new e.Vector3(-.35,-.15,1.98),new e.Vector3(-.175,-.6,2.02),new e.Vector3(0,-.15,2.05),new e.Vector3(.175,-.6,2.02),new e.Vector3(.35,-.15,1.98),new e.Vector3(.525,-.6,1.92),new e.Vector3(.7,-.1,1.85)];for(let t=0;t<c.length-1;t++)s.add(new e.LineCurve3(c[t],c[t+1]));let l=new e.TubeGeometry(s,32,.08,8,!1),u=new e.MeshBasicMaterial({color:16776960,transparent:!0,opacity:1}),d=new e.Mesh(l,u);return t.add(d),{leftEyeMaterial:r,rightEyeMaterial:a,mouthMaterial:u}}ee();var te=[],ne=new e.Group;s.add(ne);function re(){for(let t=0;t<20;t++){let t=new e.SphereGeometry(.02,2,2),n=new e.MeshBasicMaterial({color:16777028,transparent:!0,opacity:.9}),r=new e.Mesh(t,n);r.position.set((Math.random()-.5)*40,(Math.random()-.5)*30,(Math.random()-.5)*20);let i=new e.SphereGeometry(.08,8,8),a=new e.MeshBasicMaterial({color:16777096,transparent:!0,opacity:.4,side:e.BackSide}),o=new e.Mesh(i,a);r.add(o);let s=new e.PointLight(16777028,.8,3,2);r.add(s),r.userData={velocity:new e.Vector3((Math.random()-.5)*_.fireflySpeed,(Math.random()-.5)*_.fireflySpeed,(Math.random()-.5)*_.fireflySpeed),basePosition:r.position.clone(),phase:Math.random()*Math.PI*2,pulseSpeed:2+Math.random()*3,glow:o,glowMaterial:a,fireflyMaterial:n,light:s},ne.add(r),te.push(r)}}re();var A=[],j=new e.Group;s.add(j);var M=[],N=[new e.SphereGeometry(.05,6,6),new e.TetrahedronGeometry(.04,0),new e.OctahedronGeometry(.045,0)],P=new e.MeshBasicMaterial({color:v[_.particleColor],transparent:!0,opacity:0,alphaTest:.1});function ie(t){for(let n=0;n<t;n++){let t=N[Math.floor(Math.random()*N.length)],n=P.clone(),r=new e.Mesh(t,n);r.visible=!1,j.add(r),M.push(r)}}ie(100);function F(){let t;if(M.length>0)t=M.pop(),t.visible=!0;else if(A.length<_.particleCount){let n=N[Math.floor(Math.random()*N.length)],r=P.clone();t=new e.Mesh(n,r),j.add(t)}else return null;let n=new e.Color(v[_.particleColor]),r=Math.random()*.1-.05;n.offsetHSL(r,0,0),t.material.color=n,t.position.copy(C.position),t.position.z-=.8+Math.random()*.6;let i=3.5;t.position.x+=(Math.random()-.5)*i,t.position.y+=(Math.random()-.5)*i-.8;let a=.6+Math.random()*.7;return t.scale.set(a,a,a),t.rotation.set(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2),t.userData.life=1,t.userData.decay=Math.random()*.003+_.particleDecayRate,t.userData.rotationSpeed={x:(Math.random()-.5)*.015,y:(Math.random()-.5)*.015,z:(Math.random()-.5)*.015},t.userData.velocity={x:(Math.random()-.5)*.012,y:(Math.random()-.5)*.012-.002,z:(Math.random()-.5)*.012-.006},t.material.opacity=Math.random()*.9,A.push(t),t}function I(){let e=window.innerWidth<768?.5:1;C.scale.set(e,e,e)}var L;window.addEventListener(`resize`,()=>{L&&clearTimeout(L),L=setTimeout(()=>{c.aspect=window.innerWidth/window.innerHeight,c.updateProjectionMatrix(),u.setSize(window.innerWidth,window.innerHeight),f.setSize(window.innerWidth,window.innerHeight),m.setSize(window.innerWidth,window.innerHeight),h.uniforms.uResolution.value.set(window.innerWidth,window.innerHeight),I()},250)}),I();var R=new e.Vector2,z=new e.Vector2,B=new e.Vector2,V=0,H=!1,U=null;function W(e,t){let n=performance.now();n-V>16&&(z.x=R.x,z.y=R.y,R.x=e/window.innerWidth*2-1,R.y=-(t/window.innerHeight)*2+1,B.x=R.x-z.x,B.y=R.y-z.y,H=!0,U&&clearTimeout(U),U=setTimeout(()=>{H=!1},80),V=n)}window.addEventListener(`mousemove`,e=>{W(e.clientX,e.clientY)}),window.addEventListener(`touchstart`,e=>{e.touches.length>0&&W(e.touches[0].clientX,e.touches[0].clientY)},{passive:!0}),window.addEventListener(`touchmove`,e=>{e.touches.length>0&&W(e.touches[0].clientX,e.touches[0].clientY)},{passive:!0});var G=0,K=0,q=0,J=0,Y=!1,X=0;function ae(){for(let e=0;e<3;e++)f.render();for(let e=0;e<10;e++)F();f.render(),Y=!0,o.complete(u.domElement)}o.updateProgress(5),setTimeout(ae,100);function Z(t){if(requestAnimationFrame(Z),!Y)return;let n=t-J;if(J=t,n>100)return;let r=n/16.67*.01;K+=r,X++,b.uniforms.time.value=K,h.uniforms.uTime.value=K,h.uniforms.uLimboMode.value=+!!_.limboMode,Math.random()<.03?(h.uniforms.uAnalogIntensity.value=1.2+Math.random()*1.5,h.uniforms.uAnalogJitter.value=1+Math.random()*2,h.uniforms.uAnalogBleeding.value=1+Math.random()*2):(h.uniforms.uAnalogIntensity.value+=(.6-h.uniforms.uAnalogIntensity.value)*.1,h.uniforms.uAnalogJitter.value+=(.4-h.uniforms.uAnalogJitter.value)*.1,h.uniforms.uAnalogBleeding.value+=(1-h.uniforms.uAnalogBleeding.value)*.1);let i=R.x*11,a=R.y*7,o=C.position.clone();C.position.x+=(i-C.position.x)*_.followSpeed,C.position.y+=(a-C.position.y)*_.followSpeed,b.uniforms.ghostPosition.value.copy(C.position);let s=o.distanceTo(C.position);q=q*_.eyeGlowDecay+s*(1-_.eyeGlowDecay);let c=Math.sin(K*_.floatSpeed*1.5)*.03,l=Math.cos(K*_.floatSpeed*.7)*.018,u=Math.sin(K*_.floatSpeed*2.3)*.008;C.position.y+=c+l+u;let d=Math.sin(K*_.pulseSpeed)*_.pulseIntensity;Math.cos(K*_.pulseSpeed*1.4)*_.pulseIntensity*.6;let p=Math.sin(K*.6)*.12;E.emissiveIntensity=_.emissiveIntensity+d+p,te.forEach((e,t)=>{let n=e.userData,r=K+n.phase,i=Math.sin(r*n.pulseSpeed)*.4+.6;n.glowMaterial.opacity=_.fireflyGlowIntensity*.4*i,n.fireflyMaterial.opacity=_.fireflyGlowIntensity*.9*i,n.light.intensity=_.fireflyGlowIntensity*.8*i,n.velocity.x+=(Math.random()-.5)*.001,n.velocity.y+=(Math.random()-.5)*.001,n.velocity.z+=(Math.random()-.5)*.001,n.velocity.clampLength(0,_.fireflySpeed),e.position.add(n.velocity),Math.abs(e.position.x)>30&&(n.velocity.x*=-.5),Math.abs(e.position.y)>20&&(n.velocity.y*=-.5),Math.abs(e.position.z)>15&&(n.velocity.z*=-.5)});let m=new e.Vector2(i-C.position.x,a-C.position.y).normalize(),g=.1*_.wobbleAmount,v=.95;D.rotation.z=D.rotation.z*v+-m.x*g*(1-v),D.rotation.x=D.rotation.x*v+m.y*g*(1-v),D.rotation.y=Math.sin(K*1.4)*.05*_.wobbleAmount;let y=(1+Math.sin(K*2.1)*.025*_.wobbleAmount+d*.015)*(1+Math.sin(K*.8)*.012);D.scale.set(y,y,y);let x=Math.sqrt(B.x*B.x+B.y*B.y)*8;if(q>_.movementThreshold?_.eyeGlowResponse*2:_.eyeGlowResponse,(_.createParticlesOnlyWhenMoving?q>.005&&H:q>.005)&&t-G>100){let e=Math.floor(x*3),n=Math.min(_.particleCreationRate,Math.max(1,e));for(let e=0;e<n;e++)F();G=t}let S=Math.min(A.length,60);for(let e=0;e<S;e++){let t=(X+e)%A.length;if(t<A.length){let n=A[t];if(n.userData.life-=n.userData.decay,n.material.opacity=n.userData.life*.85,n.userData.velocity){n.position.x+=n.userData.velocity.x,n.position.y+=n.userData.velocity.y,n.position.z+=n.userData.velocity.z;let e=Math.cos(K*1.8+n.position.y)*8e-4;n.position.x+=e}n.userData.rotationSpeed&&(n.rotation.x+=n.userData.rotationSpeed.x,n.rotation.y+=n.userData.rotationSpeed.y,n.rotation.z+=n.userData.rotationSpeed.z),n.userData.life<=0&&(n.visible=!1,n.material.opacity=0,M.push(n),A.splice(t,1),e--)}}f.render()}var oe=new MouseEvent(`mousemove`,{clientX:window.innerWidth/2,clientY:window.innerHeight/2});window.dispatchEvent(oe),Z(0);var Q=document.getElementById(`lang-btn`),$=document.getElementById(`main-quote`);if(Q&&$){let e=`QUE HACES AQUI?!!<br/>QUIERES SER PARTE DE ESTO?<br/>....PROXIMAMENTE`,t=`WHAT ARE YOU DOING HERE?!!<br/>DO YOU WANT TO BE PART OF THIS?<br/>COMING SOON..`,n=(navigator.language||navigator.userLanguage).toLowerCase().startsWith(`es`)?`es`:`en`;n===`es`?(Q.textContent=`EN`,$.innerHTML=e):(Q.textContent=`ES`,$.innerHTML=t),Q.addEventListener(`click`,()=>{n===`es`?(n=`en`,Q.textContent=`ES`,$.innerHTML=t):(n=`es`,Q.textContent=`EN`,$.innerHTML=e)})}var se=document.querySelector(`.watermark`);if(se){let e=``;for(let t=0;t<400;t++)e+=`VICOSC `;se.textContent=e}