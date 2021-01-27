
import config from './config'
import genTestUserSig from "./_agoradebug/GenerateTestUserSig";

export function loadDriverConfig() {
    if (!config.driver) {
        throw new Error('rtc driver can not be empty')
    }

    return {
        driver: config.driver,
        options: config.drivers[config.driver]
    }
}

export function generateUserToken() {
    // TODO: 请求后端
    if (config.driver === 'tencent') {
        return genTestUserSig().userSig;
    }
    if (config.driver === 'agora') {
        return '';
    }
}
