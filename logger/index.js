/*
 * Copyright (C) 2017 Menome Technologies Inc.
 *
 * Logging wrapper.
 * TODO: Plug this into a more intelligent logging service.
 */

"use strict";

module.exports = {
  logging: true,
  info: function(msg, ...args) {
    if(this.logging) console.log("[INFO] "+msg, ...args);
  },
  error: function(msg, ...args) {
    if(this.logging) console.error("[ERROR] "+msg, ...args);
  }
}