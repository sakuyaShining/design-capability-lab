// Inspect a local research clip in an isolated headless browser; no desktop UI control.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL('C:/Users/Sakuya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const [input,out,...requested] = process.argv.slice(2);
if(!input||!out) throw Error('Usage: node capture-video.mjs input.mp4 output-directory [seconds...]');
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 if(req.url==='/video') {
  const size=fs.statSync(input).size;res.setHeader('Content-Type','video/mp4');res.setHeader('Accept-Ranges','bytes');
  const range=/bytes=(\d+)-(\d*)/.exec(req.headers.range||'');
  if(range){const start=Number(range[1]),end=range[2]?Number(range[2]):size-1;res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`);res.setHeader('Content-Length',end-start+1);fs.createReadStream(input,{start,end}).pipe(res);}
  else{res.setHeader('Content-Length',size);fs.createReadStream(input).pipe(res);}
 }
 else {res.setHeader('Content-Type','text/html');res.end('<!doctype html><body style="margin:0"><video muted preload="auto" src="/video" style="display:block"></video></body>');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{
 const page=await browser.newPage();
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
 const meta=await page.$eval('video',v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight}));
 await page.setViewportSize({width:meta.width,height:meta.height});
 const times=requested.length?requested.map(Number):[0,.2,.4,.6,.8].map(v=>v*meta.duration);
 for(const time of times){
  await page.$eval('video',(v,t)=>new Promise(resolve=>{v.pause();if(Math.abs(v.currentTime-t)<.001){resolve();return;}const timer=setTimeout(resolve,1200);v.requestVideoFrameCallback?.(()=>{clearTimeout(timer);resolve();});v.currentTime=t;}),Math.min(time,meta.duration-.05));
  await page.waitForTimeout(120);
  await page.locator('video').screenshot({path:path.join(out,`t${time.toFixed(3).replace('.','-')}.png`)});
 }
 fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify({input,...meta,sampled_seconds:times,method:'decoded HTML5 video samples; no original input timestamps; timing belongs to published clip'},null,2));
 console.log(JSON.stringify(meta));
}finally{await browser.close();server.close();}
