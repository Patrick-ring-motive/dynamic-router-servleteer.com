import {httpSafe} from './http-safe.mjs';
globalThis.responseBuffer={};

globalThis.responseBuffer.tryRemove=function(id){
 
  setTimeout(X=>{try{delete responseBuffer[id];}catch(e){}},100);
}
globalThis.bufferClear = setInterval(clearBuffer,10000);
function clearBuffer(e){
  try{
  let reses = Object.keys(globalThis.responseBuffer);
  const reses_length = reses.length;
  const nowTime = new Date().getTime();
  for(let i=0;i<reses_length;i++){try{
    
   let thisRes = globalThis.responseBuffer[reses[i]];

    if(((nowTime-thisRes.bufferTime)>10000)||(e?.message?.includes('uncaughtException'))){
      globalThis.responseBuffer.tryRemove(reses[i]);
      thisRes.endSafe('Timeout'+e?.message);
    }
    
  }catch(e){console.log(e.message);continue;}}
  }catch(e){
    console.log(e.message);
  }
}

process.on('uncaughtException',clearBuffer);

export function availRes(res){
res=httpSafe(res);
    res.resId=('responseId'+new Date().getTime() + Math.random()).replaceAll('.','_');
    res.bufferTime=new Date().getTime();
    globalThis.responseBuffer[res.resId]=res;

  res.writeAvail=function(chunk, encoding, callback){
    globalThis.responseBuffer.tryRemove(res.resId);
    return res.writeSafe(chunk, encoding, callback);
  }
  res.endAvail=function(data, encoding, callback){
    globalThis.responseBuffer.tryRemove(res.resId);
    return res.endSafe(data, encoding, callback); 
}
return res;
}

export function availReq(onReq){

  return async function(req,res){
    try{
    res=availRes(res);
      setTimeout(X=>{try{res.endAvail();delete responseBuffer[res.resId];}catch(e){}},5000);
    return await onReq(req,res);   
  } catch (e) {
    console.log(e);
    let stack = e.stack || "";
    res.statusCode = 500;
    
    return res.endAvail('500 ' + e.message + '\n' + stack);

  }
  }

  
}
