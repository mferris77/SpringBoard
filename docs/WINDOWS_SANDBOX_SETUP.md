# Windows Sandbox (WSB) Setup & Configuration

This guide explains how to enable and configure Windows Sandbox for safe tool execution in SpringBoard.

## 1. Enable Windows Sandbox

Windows Sandbox is a built-in feature of Windows 10/11 Pro, Enterprise, and Education.

### Via PowerShell (Recommended)
Run the following command in an **Elevated (Admin)** PowerShell window:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName "Containers-DisposableClientVM" -All
```

### Via Windows Features GUI
1. Open **Turn Windows features on or off** from the Start menu.
2. Scroll down and check **Windows Sandbox**.
3. Click **OK** and **Restart** your computer when prompted.

---

## 2. SpringBoard Sandbox Configuration (.wsb)

SpringBoard uses a custom `.wsb` file to define the sandboxed environment's permissions and resources. Save the following content as `SpringBoardToolbox.wsb` in the root of the project.

```xml
<Configuration>
  <VGpu>Disabled</VGpu>
  <Networking>Default</Networking>
  <MappedFolders>
    <!-- Tool Execution Workspace (Read/Write) -->
    <MappedFolder>
      <HostFolder>C:\DEV\AI\SpringBoard\sandbox_workspace</HostFolder>
      <SandboxFolder>C:\Users\WDAGUtilityAccount\Documents\Workspace</SandboxFolder>
      <ReadOnly>false</ReadOnly>
    </MappedFolder>
    <!-- Shared Assets / Python Scripts (Read-Only) -->
    <MappedFolder>
      <HostFolder>C:\DEV\AI\SpringBoard\services\springboard-python</HostFolder>
      <SandboxFolder>C:\Users\WDAGUtilityAccount\Documents\Scripts</SandboxFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>
  <LogonCommand>
    <Command>powershell.exe -ExecutionPolicy Bypass -File C:\Users\WDAGUtilityAccount\Documents\Scripts\setup_sandbox_env.ps1</Command>
  </LogonCommand>
</Configuration>
```

### Key Configuration Parameters:

| Feature | Configuration | Description |
| :--- | :--- | :--- |
| **Networking** | `<Networking>Default</Networking>` | Enables outbound internet access and local network connectivity. Required for retrieving web data or contacting the host API. |
| **File Persistence** | `<ReadOnly>false</ReadOnly>` | By default, sandbox changes use "copy-on-write" and are lost on close. Mapped folders with `ReadOnly=false` persist data back to the host machine. |
| **Shared Data** | `<MappedFolders>` | Connects host directories (like your projects or documents) into the sandbox environment. |
| **Logon Command** | `<LogonCommand>` | Executes a script inside the sandbox immediately after startup (e.g., installing dependencies or starting a WebSocket agent). |

---

## 3. Communication & Networking

### WebSocket / Protocol Communication
Windows Sandbox does not support the `<PortMap>` tag found in Docker. Instead, it operates on a virtual network bridge.

- **Sandbox to Host**: The host machine is accessible from the sandbox via the virtual gateway IP (typically the first address of the subnet, often `172.x.x.1` or the host's actual LAN IP).
- **Internet Access**: Enabled by default with the `Default` networking flag. This allows tools inside the sandbox to perform web searches or download packages via `pip` or `npm`.

### Finding the Host IP from Sandbox
To connect a sandbox tool back to the SpringBoard Electron host (for WebSocket comms), the tool can resolve the host using:
```powershell
$HostIP = (Get-NetRoute -DestinationPrefix 0.0.0.0/0).NextHop
```

---

## 4. Troubleshooting

- **Virtualization Support**: Ensure "Virtualization" is enabled in your BIOS/UEFI settings.
- **Windows Version**: Requires Windows 10/11 Pro/Enterprise 1903 or later. Home edition does not support Windows Sandbox natively without third-party workarounds.
- **Mapped Folder Path**: Ensure the `HostFolder` path exists on your machine before launching the `.wsb` file, or the sandbox will fail to initialize.
