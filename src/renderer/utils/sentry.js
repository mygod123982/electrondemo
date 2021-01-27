import Vue from 'vue'
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';

if (process.env.NODE_ENV === 'production') {

    Sentry.init({
        dsn: 'https://242da21c0bb247b485942dbe91a8a9ad@sentry.menco.cn/7',
        integrations: [new VueIntegration({ Vue, attachProps: true })],
    });
}