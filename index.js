/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Bot Framework Root
 */
"use strict";

var http = require('http');
var https = require('https');
var express = require("express");
var uuidV4 = require('uuid/v4');
var bodyParser = require('body-parser');
var fs = require('fs');

var Bot = require("./bot");
module.exports = Bot;