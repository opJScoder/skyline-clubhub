import app from './app.js';
import {PORT} from './config/env.js';
import {initDb} from './db/init.js';

await initDb();
app.listen(PORT,()=>console.log('API running on port',PORT));
