// import TRtcClient from './TRtcClient'
import AgoraRtcClient from './AgoraRtcClient'
import config from '../config'
import genTestUserSig from "./debug/GenerateTestUserSig";
// import TRTC from 'trtc-js-sdk';
import AgoraRTC from 'agora-rtc-sdk'

const RTC = AgoraRTC;

// export function loadSDK() {
//     console.log('====++', config)
//     if (config.driver === 'agora') {
//         return require('agora-rtc-sdk')
//     }
//     if (config.driver === 'tencent') {
//         return require('trtc-js-sdk')
//     }
// }

export function createRtcClient(options) {
    const driver = loadDriverConfig();

    options = Object.assign(options, driver.options)

    // if (driver.driver === 'tencent') {
    //     return new TRtcClient(options)
    // }

    if (driver.driver === 'agora') {
        return new AgoraRtcClient(options);
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

export function loadDriverConfig() {
    if (!config.driver) {
        throw new Error('rtc driver can not be empty')
    }

    return {
        driver: config.driver,
        options: config.drivers[config.driver]
    }
}


export function getCameras() {
    if (config.driver === 'agora') {
        return new Promise((resolve, reject) => {
            RTC.getDevices(devices => {
                var videoDevices = devices.filter(function (device) {
                    return device.kind === "videoinput";
                });
                resolve(videoDevices)
            }, err => {
                reject(err)
            })
        })

    }
    return RTC.getCameras();
}

export function getMicrophones() {
    if (config.driver === 'agora') {
        return new Promise((resolve, reject) => {
            RTC.getDevices(devices => {
                var audioDevices = devices.filter(function (device) {
                    return device.kind === "audioinput";
                });
                resolve(audioDevices)
            }, err => {
                reject(err)
            })
        })

    }
    return RTC.getMicrophones()
}

export function getDevices() {
    if (config.driver === 'agora') {
        return new Promise((resolve, reject) => {
            RTC.getDevices(devices => {
                resolve(devices)
            }, err => {
                reject(err)
            })
        })

    }

    return RTC.getDevices()
}

export function getDefaultDevices() {
    return new Promise((resolve, reject) => {
        let defaultDevices = {};
        getDevices().then(devices => {
            for (let device of devices) {
                if (!defaultDevices.camera && device.kind === "videoinput") {
                    defaultDevices.camera = device;
                }

                if (!defaultDevices.microphone && device.kind === "audioinput") {
                    defaultDevices.microphone = device;
                }
            }

            resolve(defaultDevices)
        }).catch(error => reject(error))
    })
}

export function createTestStream(options) {
    options.streamID = options.streamID || Math.floor(Math.random() * 10000);
    return RTC.createStream(options)
}