import { addCorsHeaders } from './cors-headers.mjs';
import {availReq,availRes} from './availability.mjs';

export async function normalizeRequest(req) {

  let reqDTO = {
    method: req.method
  };
  reqDTO.host = req.headers['host'];
  for (const property in req) {
    try {
      if (!reqDTO[property]) {
        reqDTO[property] = req[property];
      }
    } catch (e) { continue; }
  }
  reqDTO.headers = {};
  for (const property in req.headers) {
    try {
      if (!reqDTO.headers[property]) {
        reqDTO.headers[property] = req.headers[property];
      }
    } catch (e) { continue; }
  }
  if ((req.method != 'GET') && (req.method != 'HEAD')) {

    /* start reading the body of the request*/
    let bdy = "";
    req.on('readable', function() {
      bdy += req.read();
    });

    req.promise = new Promise((resolve, reject) => {
      req.resolve = resolve;
    });

    req.on('end', req.resolve);
    await req.promise;
    /* finish reading the body of the request*/

    /* start copying over the other parts of the request */

    /* fetch throws an error if you send a body with a GET request even if it is empty */
    if (bdy.length > 0) {
      reqDTO.body = bdy;
    }
  }
  /* finish copying over the other parts of the request */
  reqDTO.url = 'https://' + reqDTO.host + req.url.replaceAll('*', '');
  reqDTO.shortURL = req.url.replaceAll('*', '');
  return reqDTO;

}

export function mapResHeaders(res, response) {

  /* copy over response headers  */

  for (let [key, value] of response.headers.entries()) {
    res.setHeader(key, value);
  }
  for (let [key, value] of response.headers.keys()) {
    try {
      if (key.length > 1) {
        res.removeHeader(key);
        res.setHeader(key, value);
      }
    } catch (e) { continue; }
  }

  res.removeHeader('content-encoding');
  res.removeHeader('content-length');


  return res;

}

export function mapRes(res, response) {
  res = mapResHeaders(res, response);
  for (const property in response) {
    try {
      if (property != 'headers') {
        res[property] = response[property];
      }
    } catch (e) { continue; }
  }

  return res;

}

export function mapResDTOHeaders(resDTO, response) {


  /* copy over response headers  */

  for (let [key, value] of response.headers.entries()) {
    key = key.toLowerCase();
    if (!key.includes('content-encoding') || !key.includes('content-length')) { resDTO.headers[key] = value; }
    if (key.includes('content-type')) {
      resDTO.contentType = value;
    }
  }
  for (let [key, value] of response.headers.keys()) {
    key = key.toLowerCase();
    if (key.length > 1) {
      if (!key.includes('content-encoding') || !key.includes('content-length')) { resDTO.headers[key] = value; }
      if (key.includes('content-type')) {
        resDTO.contentType = value;
      }
    }
  }

  return resDTO;

}

export function mapResDTO(resDTO, response) {
  resDTO = mapResDTOHeaders(resDTO, response);
  for (const property in response) {
    if ((!resDTO[property]) && (!property.toLowerCase().includes('headers'))) {
      resDTO[property] = response[property];
    }
  }
  if(response.resBody){
    resDTO.body=response.resBody;
  }
  return resDTO;

}

export async function applyResponse(res, resDTO) {
  res.statusCode = resDTO.statusCode || 200;

  for (const property in resDTO) {
    try {
      if (!res[property]) {
        res[property] = resDTO[property];
      }
    } catch (e) { continue; }
  }
  if (resDTO.headers) {

    for (const property in resDTO.headers) {
      try {

        res.setHeader(property, resDTO.headers[property]);

      } catch (e) { continue; }
    }

  }

  if (resDTO.contentType) { res.setHeader('content-type', resDTO.contentType); }
  res.removeHeader('content-encoding');
  res.removeHeader('content-length');

  res = addCorsHeaders(res);

  if ((!resDTO.body) || (resDTO.statusCode?.toString()[0] == '3')) {
    return res.endAvail();
  }
  resDTO.body = resDTO.body || resDTO.resBody || await resDTO?.() || '';
  return res.endAvail(resDTO.body);
}