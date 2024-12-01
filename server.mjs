import {normalizeRequest,mapResDTO,applyResponse} from './modules/http-fetch.mjs';
import {addCorsHeaders} from './modules/cors-headers.mjs';
import fetch from 'node-fetch';
import{fileFetch,fileMap} from './modules/remote-files.mjs';

let hostTarget = 'www.google.com';
let hostList = [];


export async function serverRequestResponse(reqDTO){
  
  const resDTO = {
    headers : {}
  };
  const hostProxy = reqDTO.host;
  hostTarget = hostProxy.replace('-dynamic-router-servleteer.vercel.app','').replaceAll('-','.');
  globalThis[hostTarget] ??= await import('https://files-servleteer.vercel.app/'+hostTarget+'/'+hostTarget+'.js');
  hostList.push(hostTarget);
  const path = reqDTO.shortURL.replaceAll('*', '');
  let pat = path.split('?')[0].split('#')[0];

  if (reqDTO.shortURL === '/ping') {
    resDTO.statusCode = 200;
    return resDTO;
  }
  
  if (pat === '/link-resolver.js') {
    const response = await fileFetch(pat);
    resDTO = mapResDTO(resDTO,response);
    return resDTO;
  }

  reqDTO.host = hostTarget;
  reqDTO.headers.host = hostTarget;
  reqDTO.headers.referer = hostTarget;

    /* fetch from your desired target */
    const response = await fetch('https://' + hostTarget + path,reqDTO);

    /* if there is a problem try redirecting to the original */
    if (response.status > 399) {
      resDTO.headers['location'] = 'https://' + hostTarget + path;
      resDTO.statusCode = 302;
      return resDTO;
    }
    
    resDTO = mapResDTO(resDTO,response);

    /* check to see if the response is not a text format */
    const ct = response.headers.get('content-type');
    resDTO.headers['content-type'] = ct;
    
    if (!/image|video|audio/i.test(ct)){
      /* Copy over target response and return */
      let resBody = await response.text();
    if(/html|xml/i.test(ct)){
      resBody = resBody.replace('<head>',
        `<head modified><script src=https://`+ hostProxy + `/link-resolver.js host-list=` + btoa(JSON.stringify(hostList)) + `></script>`);
    }
      resDTO['Content-Length']=new Blob([resBody]).size;
      resDTO.body = resBody;
      return resDTO;
    } else {
      const resBody = Buffer.from(await response.arrayBuffer());
      resDTO['Content-Length'] = resBody.length;
      resDTO.body = resBody;
      return resDTO;
    }
}
