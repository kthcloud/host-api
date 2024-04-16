# Ensure script is run as root
if [ "$(id -u)" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

# Stop the service
if systemctl is-active --quiet host-api.service; then
    systemctl stop host-api.service
fi

# Remove the service if exists
if [ -f /etc/systemd/system/host-api.service ]; then
    systemctl disable host-api.service
    rm /etc/systemd/system/host-api.service
fi

# Remove the bun agent
folder=$(pwd)
export EDITOR="nano"
crontab -l | grep -v "bun $folder/agent/index.ts"  | crontab -
