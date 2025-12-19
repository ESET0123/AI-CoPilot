// import app from './app';
// import http from 'http';

// const PORT = 5000;
// // Monkey-patch server close to capture who is closing the server
// try {
//   const proto: any = (http as any).Server && (http as any).Server.prototype;
//   if (proto && !proto.__closePatched) {
//     const origClose = proto.close;
//     proto.close = function (...args: any[]) {
//       console.error('HTTP Server.close() called. Stack:');
//       console.error(new Error().stack);
//       return origClose.apply(this, args as any);
//     };
//     proto.__closePatched = true;
//   }
// } catch (err) {
//   console.error('Failed to patch http.Server.close', err);
// }

// // Patch process.exit to log stack if someone calls it
// try {
//   const origExit = (process as any).exit;
//   (process as any).exit = function (code?: number) {
//     console.error('process.exit called with code', code);
//     console.error(new Error().stack);
//     return origExit.call(process, code as any);
//   };
// } catch (err) {
//   console.error('Failed to patch process.exit', err);
// }

// const server = http.createServer(app);

// server.on('listening', () => {
//   console.log('Server event: listening, address=', server.address());
// });

// server.on('close', () => {
//   console.log('Server event: close');
// });

// server.listen(PORT, () => {
//   console.log(`Backend running on port ${PORT}`);
//   // debug: list active handles
//   try {
//     // @ts-ignore - internal API for debugging
//     const handles = (process as any)._getActiveHandles();
//     console.log('Active handles count:', handles.length);
//     handles.forEach((h: any, i: number) => {
//       console.log(i, h && h.constructor && h.constructor.name, h && h.address ? h.address() : undefined);
//     });
//   } catch (err) {
//     console.error('Could not list active handles', err);
//   }
// });

// // keep process alive long enough to observe handles in some environments
// setTimeout(() => {
//   console.log('Timeout after 5s, exiting debug wait');
// }, 5000);

//   // periodically log handles to see when/if the server handle disappears
//   let ticks = 0;
//   const iv = setInterval(() => {
//     try {
//       // @ts-ignore
//       const handles = (process as any)._getActiveHandles();
//       console.log('tick', ticks, 'active handles:', handles.length);
//       handles.forEach((h: any, i: number) => {
//         console.log(i, h && h.constructor && h.constructor.name, h && typeof h.address === 'function' ? h.address() : undefined);
//       });
//     } catch (err) {
//       console.error('Could not list active handles', err);
//     }

//     ticks += 1;
//     if (ticks > 7) {
//       clearInterval(iv);
//       console.log('Finished debug ticks');
//     }
//   }, 1000);


import app from './app';
import http from 'http';

const PORT = 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
