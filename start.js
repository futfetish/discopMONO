const { spawn } = require("child_process");

const services = [
  { name: "mainWebService", command: "npm", args: ["run", "dev"] },
  { name: "webSocketService", command: "npm", args: ["run", "dev"] }
];

const startService = (service) => {
  console.log(`Запуск ${service.name}...`);
  const childProcess = spawn(service.command, service.args, {
    cwd: service.name,
    env: process.env,
    shell: true
  });

  childProcess.stdout.on("data", (data) => {
    console.log(`stdout ${service.name}:\n${data}`);
  });

  childProcess.stderr.on("data", (data) => {
    console.error(`stderr ${service.name}:\n${data}`);
  });

  childProcess.on("exit", (code) => {
    if (code === 0) {
      console.log(`${service.name} завершен успешно`);
    } else {
      console.error(`Ошибка при запуске сервиса ${service.name}: ${code}`);
    }
  });
};

const start = (services) => {
  services.forEach(service => startService(service));
  console.log("Все сервисы запущены");
};

start(services);