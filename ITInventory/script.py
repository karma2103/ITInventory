import psutil
import requests
import platform  # Import the platform module
import os  # Import the os module

def capture_info():
    try:
        # Inform the user about data collection and ask for consent
        print("This software collects system information for diagnostic purposes.")
        consent = input("Do you consent to share your system information? (yes/no): ").lower().strip()

        if consent == 'yes':
            # Get system information and send it to the server
            collect_and_send_info()
        elif consent == 'no':
            print("You declined to share your system information. Exiting.")
        else:
            print("Invalid input. Please enter 'yes' or 'no'.")
            # Optionally, you can recursively call capture_info() here to prompt the user again
            # capture_info()

    except Exception as e:
        print('Error capturing information:', e)

def collect_and_send_info():
    # Get system information
    name = get_name()
    ip_address = get_ip_address()
    mac_address = get_mac_address()
    os_info = get_os()
    device_type = get_device_type()
    processor = get_processor()
    manufacturer = get_manufacturer()
    model = get_model()
    hostname = get_hostname()
    serial_number = get_serial_number()
    memory = get_installed_memory()
    storage = get_total_storage()
    is_hdd_or_is_ssd = get_storage_type()

    # Construct client information object
    client_info = {
        'name': name,
        'ip_address': ip_address,
        'mac_address': mac_address,
        'os_info': os_info,
        'device_type': device_type,
        'processor': processor,
        'manufacturer': manufacturer,
        'model': model,
        'hostname': hostname,
        'serial_number': serial_number,
        'memory': memory,
        'storage': storage,
        'is_hdd_or_is_ssd': is_hdd_or_is_ssd
    }

    # Send information to server
    server_endpoint = 'http://172.16.21.91:8080/storeInfo'  # Update with your server endpoint
    response = requests.post(server_endpoint, json=client_info)

    if response.status_code == 200:
        print('Information captured and sent successfully!')
    else:
        print('Error sending information to the server:', response.status_code)


# Function to get the name of the machine
def get_name():
    return psutil.users()[0].name()

# Function to get the IP address of the machine
def get_ip_address():
    return psutil.net_if_addrs()['Ethernet'][0].address

# Function to get the MAC address of the machine
def get_mac_address():
    return psutil.net_if_addrs()['Ethernet'][0].address

# Function to get the OS of the machine
def get_os():
    return platform.system()

# Function to get the device type of the machine
def get_device_type():
    return platform.machine()  # Corrected function call

# Function to get the processor of the machine
def get_processor():
    return psutil.cpu_info()[0].brand

# Function to get the manufacturer of the machine
def get_manufacturer():
    return 'N/A'  # Unfortunately, this information may not be available in all systems

# Function to get the model of the machine
def get_model():
    return 'N/A'  # Unfortunately, this information may not be available in all systems

# Function to get the hostname of the machine
def get_hostname():
    return platform.node()  # Corrected function call

# Function to get the serial number of the machine
def get_serial_number():
    return 'N/A'  # Unfortunately, this information may not be available in all systems

# Function to get the installed memory of the machine
def get_installed_memory():
    return psutil.virtual_memory().total

# Function to get the total storage of the machine
def get_total_storage():
    return psutil.disk_usage('/').total

# Function to get the storage type of the machine
def get_storage_type():
    partitions = psutil.disk_partitions(all=False)
    for partition in partitions:
        if 'rw' in partition.opts.lower():
            return 'HDD'
    return 'SSD'

# Run the function to capture and send client information
capture_info()
