import fetch, { FormData, Blob } from 'node-fetch';

async function run() {
  const fd = new FormData();
  fd.append("image", new Blob(["hello"], { type: "text/plain" }), "hello.txt");
  
  const res = await fetch("http://localhost:3000/api/analyze-bill", {
    method: "POST",
    body: fd
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text.substring(0, 200));
}

run().catch(console.error);
