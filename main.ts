import * as dotenv from 'dotenv';
import { start } from './src/startup';
import { Logger } from './src/Bot/utils/Logger';

const logLocation = 'main';
dotenv.config({ path: '.env' });
(async () => {
    Logger.setDefaultConsole();
    if (!process.env['BOT_TOKEN']) {
        Logger.error(logLocation, 'BOT_TOKEN not found', {});
    }

    await start(process.env['BOT_TOKEN'], './db');
})();