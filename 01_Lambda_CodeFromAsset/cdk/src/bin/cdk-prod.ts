#!/usr/bin/env node
import { prodConfig } from '../config/prod.js';
import { createApp } from './createApp.js';

createApp(prodConfig);
