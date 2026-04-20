#!/usr/bin/env node
import { devConfig } from '../config/dev.js';
import { createApp } from './createApp.js';

createApp(devConfig);
