# Skill Monitoring Service

***Skill Monitoring Service*** the the service responsible for the discovery, indentification,  matching, monitoring and interfacing of a skill implementated in an OPC UA server. The server should follow the skill concept of the SP347 Project.

The nodeset of the OPC UA server as well as an instantiation example can be found in the folder: ***information_model***.The information Type system can be imported from the file ***AutomationSkillType_OptionalStateMachine.xml*** and the instances from the file ***SkillADD_OptionalStateMachine.xml***.

The default port of the service is ***8080*** and can be changed in the configuration file ***backend/default_setting.js***. The service also exposes the port ***3800*** for a connection with a knowledge graph.

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
If your host/edge do not have an internet connection, we also provide a precompiled version. For the installation of these pacakges, you will need 7-Zip. to install it, just go on [official 7-Zip website](https://www.7-zip.de/), download the x64 installer and follow the instructions.

If the installation was successful, you should be able to run the following command on a windows OS.

    $ "C:\Program Files\7-Zip\7z.exe" --help
    $ 7-Zip [64] 9.20  Copyright (c) 1999-2010 Igor Pavlov  2010-11-18
    $ Usage: 7z <command> [<switches>...] <archive_name> [<file_names>...]
    $   [<@listfiles...>]

## Installation

#### NodeJS

Step 1: Clone this repo.

Step 2: Install the dependencies.

```bash
npm install
```

Step 2a: (Alternative) Unpack and Install all precompiled dependencies using `7-Zip`

```bash
$ _install_all.bat
```
Step 3: Start the application. Run the following

```bash
npm start
```

After a sucessfull startup the following output should be printed. Please notice the information that all modules have been sucessfully initialized and started.

```console

C:\GitHub\OPEN-ACCESS>npm start

> node backend/SkillMonitoring.js

18 May 09:30:36 - [info] MICROSERVICE[OPCUAClientService0] initialized successfully!
18 May 09:30:36 - [info] MICROSERVICE[WebServerService0] initialized successfully!
18 May 09:30:36 - [info] Configurator initialized successfully.
18 May 09:30:36 - [info] SkillMonitoring initialized successfully.


===============================
SkillMonitoring engine.welcome
===============================

18 May 09:30:36 - [info] runtime.version Node JSv12.14.1
18 May 09:30:36 - [info] Windows_NT 6.1.7601 x64 LE
18 May 09:30:36 - [info] MICROSERVICE[OPCUAClientService0] started successfully!
18 May 09:30:36 - [info] Configurator start successfully.
18 May 09:30:36 - [info] SkillMonitoring start successfully.
18 May 09:30:36 - [info] MICROSERVICE[WebServerService0] ######### ==> Web app listening on port 8080.
18 May 09:30:36 - [info] MICROSERVICE[WebServerService0] started successfully.
18 May 09:30:36 - [info] Configurator webserver initialized successfully.

```
The UI of the service is now accessible at [http://localhost:8080/](http://localhost:8080/).

#### Deploy as a Microservice using Docker[Swarm]

You can also deploy as a microservice inside a Docker container:

Step 1: Clone the repo

Step 2: Build the Docker image

```bash
docker build -t skill_monitoring .
```

Step 3: Run the Docker container locally:

```bash
docker run -p 8080:8080 -p 3800:3800 -d skill_monitoring
```

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

See `LICENSE` for more information.

<!-- CONTACT -->
## Contact

Jupiter Bakakeu - [@JBakakeu](https://twitter.com/JBakakeu) - jupiter.bakakeu@gmail.com