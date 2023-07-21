import fetch from 'node-fetch';

export let fileMap={
  '/link-resolver.js':'https://files-servleteer.vercel.app/elgoog/link-resolver.js'
                   };

export async function fileFetch(filename){

let url = fileMap[filename];
let response = await fetch(url);
  
response.resBody = Buffer.from(await response.arrayBuffer());
 
return response;
  
}