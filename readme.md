# Skill Invocation Cllient

SP 347 Skill Invocation Client Example

---
## Requirements

For development, you will only need Node.js and a node global package, `npm`, installed in your environement. If your host have no internet connection make sure to install `7-Zip`.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

### 7-Zip
  Just go on [official 7-Zip website](https://www.7-zip.de/), download the x64 installer and follow the instructions.

If the installation was successful, you should be able to run the following command on a windows OS.

    $ "C:\Program Files\7-Zip\7z.exe" --help
    $ 7-Zip [64] 9.20  Copyright (c) 1999-2010 Igor Pavlov  2010-11-18
    $ Usage: 7z <command> [<switches>...] <archive_name> [<file_names>...]
    $   [<@listfiles...>]

---
## Installation

### Download the project

    $ git clone https://github.com/jupiterbak/WDISS
    $ cd WDISS

### Unpack and Install all dependencies using `7-Zip`

```
$ _install_all.bat
```

### Install all precompiled dependencies via `npm`
Alternatively, if the host has an internet connection, update and install the packages using `npm`.

```
$ _install_all_via_npm.bat
```

## Start the DEMO (recommended)

Step 1: start the ontology server annd the skill invocation client. To do it, run the following script:
```bash
$ _start_simple.bat
```

Step 2:

Open [http://localhost:8080](http://localhost:8080) and take a look around. Contact jupiter for a small short introduction.


<!-- CONTRIBUTING -->
## Contributing

Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->
## Contact

Jupiter Bakakeu - [@JBakakeu](https://twitter.com/JBakakeu) - jupiter.bakakeu@gmail.com

Project Link: [https://github.com/jupiterbak/WDISS](https://github.com/jupiterbak/WDISS)