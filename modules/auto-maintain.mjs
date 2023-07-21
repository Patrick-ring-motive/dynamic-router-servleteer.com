const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export default function maintain(server){

void async function AutomaticRestart() {

  while (true) {
    await sleep(MINUTE);
    if (!server.listening) {
      try{
      server.listen(3000);
      }catch(e){
        console.log(e.message);
        continue;
      }
    }

  }

}?.();

void async function ClearIdleConnections() {

  while (true) {
    await sleep(HOUR);
    if (server.listening) {
      server.closeIdleConnections();
    }

  }

}?.();

void async function DailyClearAllConnections() {

  while (true) {
    await sleep(DAY);
    if (server.listening) {
      server.closeAllConnections();
    }

  }

}?.();


void async function WeeklyReboot() {

  while (true) {
    await sleep(WEEK);
    if (server.listening) {
      server.close(Ͱ=>server.listen(3000));
    }

  }

}?.();

  void async function MonthlyHardReboot() {

  while (true) {
    await sleep(WEEK);
    await sleep(WEEK);
    await sleep(WEEK);
    await sleep(WEEK);
    
    server.listen(3000);
    server.listen(3000);

  }

}?.();

}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
