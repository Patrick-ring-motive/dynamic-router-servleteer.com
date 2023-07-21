export function httpSafe(res){

  res.writeSafe=function(chunk, encoding, callback){
    try{
      if(!res.writableEnded){
        return res.write(chunk, encoding, callback);
      }else{
        return !res.writableEnded;
      }
    }catch(e){
      console.log(e);
      return e.message;
    }
  }

    res.endSafe=function(data, encoding, callback){
    try{
      if(!res.writableEnded){
        return res.end(data, encoding, callback);
      }else{
        //console.log(e);
        return !res.writableEnded;
      }
    }catch(e){
     // console.log(e);
      return e.message;
    }
  }
return res;
}