#!/bin/bash
export PORT=${PORT:-3123}
exec node dist/index.js
