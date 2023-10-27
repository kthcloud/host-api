## 🖥️ kthcloud/host-api

An API installed locally on kthcloud servers. This API exposed the host's information to the kthcloud platform, such as CPU, memory, disk, and GPU information. The API is installed automatically when the host is provisioned, see [kthcloud/ansible-setup-host](https://github.com/kthcloud/ansible-setup-host) for more information.

## 🌐 API
### GET /capacities
Exposes the host's CPU, memory, and disk information. 

### GET /gpuInfo
Exposes the host's GPU information, including slot, bus, vendor, vendor ID, and device ID.

### GET /status
Exposes the host's status, such as the temperature and usage of CPU, RAM and network.