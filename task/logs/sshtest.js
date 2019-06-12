let process = require("child_process");

let spawn = process.spawn("sh", ["test.sh"]);
spawn.stdout.on('data', (data) => {
    console.log("data", data.toString());
});

spawn.stderr.on('data', (data) => {
    console.log(`spawn stderr: ${data}`);
});

spawn.on('close', (code) => {
    console.log(`spawn 进程退出码：${code}`);
});
