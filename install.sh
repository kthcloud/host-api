#!/bin/sh

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: ./install.sh [folder]"
    echo "folder: The folder where the host-api is installed. Uses pwd if not provided."
    exit 0
fi

if [ -z "$1" ]; then
    folder=$(pwd)
else
    folder=$1
fi

# Ensure script is run as root
if [ "$(id -u)" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

# Ensure Bun is installed, check in /usr/local/bin and /usr/bin
if [ ! -f /usr/local/bin/bun ] && [ ! -f /usr/bin/bun ]; then
    echo "Bun is not installed. Please install Bun first."
    exit 1
fi

# Install dependencies
description="An API for status reporting to kthcloud"
pre_start_cmd="bun install"
start_cmd="bun start"

# Install the systemd service host-api.service
echo "[Unit]
Description=$description
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$folder
ExecStartPre=$pre_start_cmd
ExecStart=$start_cmd
Restart=on-failure

[Install]
WantedBy=multi-user.target
" > /etc/systemd/system//host-api.service

systemctl daemon-reload
systemctl enable host-api.service
systemctl start host-api.service

# Install agent that reports the status as active, run $pwd/agent/index.ts every 5 seconds
export EDITOR="nano"
(crontab -l 2>/dev/null | grep -Fq "* * * * * bun $folder/agent/index.ts") || (crontab -l 2>/dev/null; echo "* * * * * bun $folder/agent/index.ts") | crontab -
