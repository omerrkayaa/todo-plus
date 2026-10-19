import { createApp } from "./app.js";
import { getConfig } from "./config.js";

const config = getConfig();
const app = createApp();
app.listen(config.port, () => {
  console.log(`Docket doküman asistanı http://127.0.0.1:${config.port} adresinde çalışıyor.`);
});
